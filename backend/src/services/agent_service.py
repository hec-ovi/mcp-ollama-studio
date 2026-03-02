from collections.abc import AsyncIterator
from dataclasses import dataclass
from pathlib import Path

from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

from src.core.exceptions import AgentExecutionError
from src.core.settings import Settings
from src.lib.message_utils import extract_text_content, to_langchain_messages
from src.models.chat import ChatCompletionRequest, ReasoningStep, StreamEvent, StreamEventType
from src.services.mcp_registry_service import MCPRegistryService
from src.tools.llm_client_factory import LLMClientFactory
from src.tools.prompt_loader import PromptLoader


@dataclass(slots=True)
class AgentResult:
    """Final completion output from the agent run."""

    content: str
    trace: list[ReasoningStep]
    model: str


class AgentService:
    """Executes LangGraph agent runs with MCP tools."""

    def __init__(self, settings: Settings, registry: MCPRegistryService) -> None:
        self._settings = settings
        self._registry = registry
        prompts_dir = Path(__file__).resolve().parents[1] / "prompts"
        self._prompt_loader = PromptLoader(prompts_dir=prompts_dir)
        self._llm_factory = LLMClientFactory(settings=settings)

    @property
    def default_model(self) -> str:
        """Return the configured default model name."""
        return self._settings.llm_model

    async def run_completion(self, request: ChatCompletionRequest) -> AgentResult:
        """Run a non-streaming completion by collecting streaming events."""
        chunks: list[str] = []
        traces: list[ReasoningStep] = []
        model_name = request.model or self._settings.ollama_model

        async for event in self.stream_events(request):
            if event.type == StreamEventType.TOKEN and event.token is not None:
                chunks.append(event.token)
            elif event.type == StreamEventType.TRACE and event.trace is not None:
                traces.append(event.trace)

        content = "".join(chunks).strip()
        return AgentResult(content=content, trace=traces, model=model_name)

    async def stream_events(self, request: ChatCompletionRequest) -> AsyncIterator[StreamEvent]:
        """Stream token and reasoning events from the LangGraph agent."""
        model_name = request.model or self._settings.ollama_model
        temperature = request.temperature
        if temperature is None:
            temperature = self._settings.llm_temperature

        selected_servers = self._registry.resolve_servers(request.mcp_servers)
        trace_summary = ", ".join(server.label for server in selected_servers)
        yield StreamEvent(
            type=StreamEventType.TRACE,
            trace=ReasoningStep(
                node="bootstrap",
                summary=f"Initialized MCP servers: {trace_summary}",
            ),
        )

        client = MultiServerMCPClient(self._registry.to_client_config(selected_servers))

        try:
            tools = await client.get_tools()
            system_prompt = self._prompt_loader.load("system_prompt.md")
            model = self._llm_factory.create(model_name=model_name, temperature=temperature)
            agent = create_react_agent(model=model, tools=tools, prompt=system_prompt)

            async for mode, chunk in agent.astream(
                {"messages": to_langchain_messages(request.messages)},
                config={"recursion_limit": request.max_steps},
                stream_mode=["messages", "updates"],
            ):
                if mode == "messages":
                    for event in self._stream_message_chunk(chunk):
                        yield event
                    continue

                if mode == "updates":
                    for step in self._parse_update_chunk(chunk):
                        yield StreamEvent(type=StreamEventType.TRACE, trace=step)
        except Exception as exc:
            raise AgentExecutionError(str(exc)) from exc

        yield StreamEvent(type=StreamEventType.DONE)

    def _stream_message_chunk(self, chunk: object) -> list[StreamEvent]:
        """Convert a raw LangGraph message chunk into token events."""
        if not isinstance(chunk, tuple) or len(chunk) != 2:
            return []

        message_chunk, metadata = chunk
        if not isinstance(metadata, dict):
            return []

        node = metadata.get("langgraph_node")
        if node != "agent":
            return []

        text = extract_text_content(getattr(message_chunk, "content", ""))
        if not text:
            return []

        return [StreamEvent(type=StreamEventType.TOKEN, token=text)]

    def _parse_update_chunk(self, chunk: object) -> list[ReasoningStep]:
        """Build high-level reasoning trace messages from graph updates."""
        if not isinstance(chunk, dict):
            return []

        steps: list[ReasoningStep] = []

        for node, payload in chunk.items():
            if not isinstance(payload, dict):
                continue

            messages = payload.get("messages")
            if not isinstance(messages, list):
                continue

            for message in messages:
                tool_calls = getattr(message, "tool_calls", None)
                if tool_calls:
                    names = [
                        call.get("name", "unknown")
                        for call in tool_calls
                        if isinstance(call, dict)
                    ]
                    if names:
                        steps.append(
                            ReasoningStep(
                                node=str(node),
                                summary=f"Model selected tool call(s): {', '.join(names)}",
                            )
                        )
                    continue

                message_type = getattr(message, "type", "")
                if message_type == "tool":
                    tool_name = getattr(message, "name", "tool")
                    preview = extract_text_content(getattr(message, "content", "")).strip()
                    if len(preview) > 120:
                        preview = f"{preview[:117]}..."
                    detail = preview or "Tool returned data"
                    steps.append(
                        ReasoningStep(
                            node=str(node),
                            summary=f"Tool '{tool_name}' responded: {detail}",
                        )
                    )

        return steps
