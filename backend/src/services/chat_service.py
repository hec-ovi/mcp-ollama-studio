import json
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from uuid import uuid4

from src.core.exceptions import AgentExecutionError
from src.models.chat import (
    ChatCompletionChoice,
    ChatCompletionChoiceMessage,
    ChatCompletionRequest,
    ChatCompletionResponse,
    StreamEventType,
)
from src.services.agent_service import AgentService


class ChatService:
    """Formats completion responses for HTTP routes."""

    def __init__(self, agent_service: AgentService) -> None:
        self._agent_service = agent_service

    async def create_completion(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        """Execute a full completion and return final response payload."""
        result = await self._agent_service.run_completion(request)
        return ChatCompletionResponse(
            model=result.model,
            choices=[
                ChatCompletionChoice(
                    message=ChatCompletionChoiceMessage(content=result.content),
                )
            ],
            reasoning_trace=result.trace,
        )

    async def stream_completion(self, request: ChatCompletionRequest) -> AsyncIterator[bytes]:
        """Yield OpenAI-style SSE chunks and trace events."""
        completion_id = f"chatcmpl-{uuid4().hex}"
        created = int(datetime.now(UTC).timestamp())
        model_name = request.model or self._agent_service.default_model

        stream_finished = False
        token_emitted = False
        error_emitted = False
        try:
            async for event in self._agent_service.stream_events(request):
                if event.type == StreamEventType.TOKEN and event.token is not None:
                    token_emitted = True
                    payload = {
                        "id": completion_id,
                        "object": "chat.completion.chunk",
                        "created": created,
                        "model": model_name,
                        "choices": [
                            {
                                "index": 0,
                                "delta": {"content": event.token},
                                "finish_reason": None,
                            }
                        ],
                    }
                    yield self._format_data_line(payload)
                    continue

                if event.type == StreamEventType.TRACE and event.trace is not None:
                    yield self._format_event_line(
                        "trace",
                        event.trace.model_dump(mode="json"),
                    )
                    continue

                if event.type == StreamEventType.ERROR and event.error is not None:
                    error_emitted = True
                    yield self._format_event_line("error", {"message": event.error})
                    continue

                if event.type == StreamEventType.DONE:
                    stream_finished = True
                    break
        except AgentExecutionError as exc:
            error_emitted = True
            yield self._format_event_line("error", {"message": self._compact_error(str(exc))})
        except Exception as exc:  # pragma: no cover - defensive catch for stream safety
            error_emitted = True
            yield self._format_event_line("error", {"message": self._compact_error(str(exc))})

        if not stream_finished:
            # Close the client stream even when the upstream agent run fails.
            stream_finished = True

        if not token_emitted and not error_emitted:
            error_emitted = True
            yield self._format_event_line(
                "error",
                {
                    "message": (
                        "The agent finished without generating a final text answer. "
                        "Try a narrower prompt or select fewer MCP tools."
                    )
                },
            )

        if stream_finished:
            final_payload = {
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": created,
                "model": model_name,
                "choices": [
                    {
                        "index": 0,
                        "delta": {},
                        "finish_reason": "stop",
                    }
                ],
            }
            yield self._format_data_line(final_payload)
            yield b"data: [DONE]\n\n"

    def _format_data_line(self, payload: dict[str, object]) -> bytes:
        """Format a default SSE data event."""
        return f"data: {json.dumps(payload)}\n\n".encode()

    def _format_event_line(self, event_name: str, payload: dict[str, object]) -> bytes:
        """Format a named SSE event."""
        return (
            f"event: {event_name}\n"
            f"data: {json.dumps(payload)}\n\n"
        ).encode()

    def _compact_error(self, message: str) -> str:
        """Normalize long multi-line failures into concise stream-safe messages."""
        cleaned = " ".join(message.split())
        if not cleaned:
            return "Streaming completion failed."
        if len(cleaned) <= 400:
            return cleaned
        return f"{cleaned[:397]}..."
