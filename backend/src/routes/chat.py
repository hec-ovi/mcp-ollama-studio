from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from src.core.dependencies import get_chat_service
from src.core.exceptions import AgentExecutionError, MCPServerNotFoundError
from src.models.chat import ChatCompletionRequest, ChatCompletionResponse
from src.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/completions")
async def create_chat_completion(
    request: ChatCompletionRequest,
    chat_service: Annotated[ChatService, Depends(get_chat_service)],
) -> ChatCompletionResponse | StreamingResponse:
    """Create a completion response, optionally as SSE stream."""
    try:
        if request.stream:
            stream = chat_service.stream_completion(request)
            return StreamingResponse(stream, media_type="text/event-stream")
        return await chat_service.create_completion(request)
    except MCPServerNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except AgentExecutionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
