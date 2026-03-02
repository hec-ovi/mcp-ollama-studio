class MCPConfigurationError(Exception):
    """Raised when MCP server configuration is invalid."""


class MCPServerNotFoundError(Exception):
    """Raised when a requested MCP server is not configured."""


class AgentExecutionError(Exception):
    """Raised when the LangGraph agent execution fails."""
