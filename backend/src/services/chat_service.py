import json
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from uuid import uuid4

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

        async for event in self._agent_service.stream_events(request):
            if event.type == StreamEventType.TOKEN and event.token is not None:
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
                yield self._format_event_line("trace", event.trace.model_dump())
                continue

            if event.type == StreamEventType.ERROR and event.error is not None:
                yield self._format_event_line("error", {"message": event.error})
                continue

            if event.type == StreamEventType.DONE:
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
        return f"data: {json.dumps(payload)}\\n\\n".encode()

    def _format_event_line(self, event_name: str, payload: dict[str, object]) -> bytes:
        """Format a named SSE event."""
        return (
            f"event: {event_name}\\n"
            f"data: {json.dumps(payload)}\\n\\n"
        ).encode()
