from typing import Annotated

from fastapi import Depends

from src.core.settings import Settings, get_settings
from src.services.agent_service import AgentService
from src.services.chat_service import ChatService
from src.services.mcp_registry_service import MCPRegistryService


def get_registry(settings: Annotated[Settings, Depends(get_settings)]) -> MCPRegistryService:
    """Build MCP registry service dependency."""
    return MCPRegistryService(settings=settings)


def get_agent_service(
    settings: Annotated[Settings, Depends(get_settings)],
    registry: Annotated[MCPRegistryService, Depends(get_registry)],
) -> AgentService:
    """Build Agent service dependency."""
    return AgentService(settings=settings, registry=registry)


def get_chat_service(
    agent_service: Annotated[AgentService, Depends(get_agent_service)],
) -> ChatService:
    """Build Chat service dependency."""
    return ChatService(agent_service=agent_service)
