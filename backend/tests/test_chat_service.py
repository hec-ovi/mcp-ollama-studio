import pytest

from src.core.exceptions import AgentExecutionError
from src.models.chat import (
    ChatCompletionRequest,
    ChatMessage,
    ReasoningStep,
    StreamEvent,
    StreamEventType,
)
from src.services.chat_service import ChatService


class _FailingAgentService:
    default_model = "gpt-oss:20b"

    async def stream_events(self, _request: ChatCompletionRequest):
        if False:  # pragma: no cover
            yield b""
        raise AgentExecutionError("Tool failed.\nThis is a multi-line error message.")


class _NoTokenAgentService:
    default_model = "gpt-oss:20b"

    async def stream_events(self, _request: ChatCompletionRequest):
        yield StreamEvent(
            type=StreamEventType.TRACE,
            trace=ReasoningStep(node="bootstrap", summary="Initialized MCP servers"),
        )
        yield StreamEvent(type=StreamEventType.DONE)


@pytest.mark.asyncio
async def test_stream_completion_yields_error_event_and_done_when_agent_fails() -> None:
    service = ChatService(agent_service=_FailingAgentService())  # type: ignore[arg-type]
    request = ChatCompletionRequest(
        messages=[ChatMessage(role="user", content="hello")],
        stream=True,
    )

    chunks = [chunk async for chunk in service.stream_completion(request)]
    payload = b"".join(chunks).decode()

    assert "event: error" in payload
    assert "Tool failed. This is a multi-line error message." in payload
    assert '"finish_reason": "stop"' in payload
    assert "data: [DONE]" in payload


@pytest.mark.asyncio
async def test_stream_completion_emits_error_when_no_tokens_were_generated() -> None:
    service = ChatService(agent_service=_NoTokenAgentService())  # type: ignore[arg-type]
    request = ChatCompletionRequest(
        messages=[ChatMessage(role="user", content="hello")],
        stream=True,
    )

    chunks = [chunk async for chunk in service.stream_completion(request)]
    payload = b"".join(chunks).decode()

    assert "event: error" in payload
    assert "finished without generating a final text answer" in payload
    assert '"finish_reason": "stop"' in payload
    assert "data: [DONE]" in payload
