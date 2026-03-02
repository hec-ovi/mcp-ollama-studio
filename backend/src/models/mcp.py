from datetime import UTC, datetime
from enum import StrEnum

from pydantic import AnyHttpUrl, BaseModel, Field, model_validator


class MCPTransport(StrEnum):
    """Supported MCP transport types."""

    STREAMABLE_HTTP = "streamable_http"
    STDIO = "stdio"


class MCPServerConfig(BaseModel):
    """Configuration for one MCP server."""

    name: str = Field(description="Unique server identifier.")
    label: str = Field(description="User-facing server name.")
    description: str = Field(description="Short description of server value.")
    instructions: str = Field(description="Guidance for when the agent should use this server.")
    transport: MCPTransport = Field(description="Transport protocol used by the server.")
    enabled: bool = Field(default=True, description="Whether the server is active by default.")
    url: AnyHttpUrl | None = Field(default=None, description="URL for streamable HTTP servers.")
    command: str | None = Field(default=None, description="Executable command for stdio servers.")
    args: list[str] = Field(default_factory=list, description="Arguments passed to the command.")
    env: dict[str, str] = Field(
        default_factory=dict,
        description="Environment variables for stdio.",
    )

    @model_validator(mode="after")
    def validate_transport_fields(self) -> "MCPServerConfig":
        """Ensure required fields exist for each transport type."""
        if self.transport == MCPTransport.STREAMABLE_HTTP and self.url is None:
            raise ValueError("streamable_http transport requires a url")
        if self.transport == MCPTransport.STDIO and self.command is None:
            raise ValueError("stdio transport requires a command")
        return self


class MCPServerStatus(BaseModel):
    """Runtime status for one MCP server."""

    name: str = Field(description="Unique server identifier.")
    label: str = Field(description="User-facing server name.")
    description: str = Field(description="Short description of server value.")
    instructions: str = Field(description="Guidance for when the agent should use this server.")
    transport: MCPTransport = Field(description="Transport protocol used by the server.")
    enabled: bool = Field(description="Whether the server is active by default.")
    available: bool = Field(description="Whether the backend can currently reach the server.")
    detail: str = Field(description="Diagnostic detail about current availability.")
    checked_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="UTC timestamp of the last availability check.",
    )


class MCPServerListResponse(BaseModel):
    """Response model for configured MCP server statuses."""

    servers: list[MCPServerStatus] = Field(description="Configured MCP servers with availability.")
