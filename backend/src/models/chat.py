from datetime import UTC, datetime
from enum import StrEnum
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """One chat message in the request conversation."""

    role: Literal["system", "user", "assistant"] = Field(description="Message role.")
    content: str = Field(description="Message text content.")


class ChatCompletionRequest(BaseModel):
    """Request payload for chat completion endpoints."""

    model: str | None = Field(
        default=None,
        description="Optional model override for the OpenAI-compatible adapter.",
    )
    messages: list[ChatMessage] = Field(description="Conversation messages in order.")
    stream: bool = Field(default=False, description="Return SSE chunks when true.")
    temperature: float | None = Field(
        default=None,
        ge=0,
        le=2,
        description="Sampling temperature.",
    )
    max_steps: int = Field(
        default=12,
        ge=1,
        le=24,
        description="Maximum LangGraph recursion steps.",
    )
    mcp_servers: list[str] | None = Field(
        default=None,
        description="Optional list of server names to use for this request.",
    )


class ReasoningStep(BaseModel):
    """Structured, user-visible reasoning trace step."""

    node: str = Field(description="LangGraph node or subsystem that produced the step.")
    summary: str = Field(description="Human-readable summary of the step.")
    occurred_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="UTC timestamp when this step was emitted.",
    )


class ChatCompletionChoiceMessage(BaseModel):
    """Assistant message output model."""

    role: Literal["assistant"] = Field(default="assistant", description="Message role.")
    content: str = Field(description="Assistant text response.")


class ChatCompletionChoice(BaseModel):
    """Single completion choice."""

    index: int = Field(default=0, description="Choice index.")
    message: ChatCompletionChoiceMessage = Field(description="Assistant output message.")
    finish_reason: Literal["stop"] = Field(default="stop", description="Why generation ended.")


class ChatCompletionResponse(BaseModel):
    """Non-streaming completion response."""

    id: str = Field(default_factory=lambda: f"chatcmpl-{uuid4().hex}", description="Completion ID.")
    object: Literal["chat.completion"] = Field(
        default="chat.completion",
        description="Object type.",
    )
    created: int = Field(
        default_factory=lambda: int(datetime.now(UTC).timestamp()),
        description="Unix timestamp.",
    )
    model: str = Field(description="Model used to generate the completion.")
    choices: list[ChatCompletionChoice] = Field(description="Completion choices.")
    reasoning_trace: list[ReasoningStep] = Field(
        default_factory=list,
        description="High-level reasoning trace from agent/tool execution.",
    )


class StreamEventType(StrEnum):
    """Supported streaming event types."""

    TOKEN = "token"
    TRACE = "trace"
    ERROR = "error"
    DONE = "done"


class StreamEvent(BaseModel):
    """One internal event emitted during streaming generation."""

    type: StreamEventType = Field(description="Event type.")
    token: str | None = Field(default=None, description="Token text for incremental output.")
    trace: ReasoningStep | None = Field(default=None, description="Trace payload for step updates.")
    error: str | None = Field(default=None, description="Error message when type is error.")


class HealthResponse(BaseModel):
    """Health endpoint response."""

    status: Literal["ok"] = Field(default="ok", description="Current API health.")
