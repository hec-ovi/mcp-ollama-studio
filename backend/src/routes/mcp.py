from typing import Annotated

from fastapi import APIRouter, Depends

from src.core.dependencies import get_registry
from src.models.mcp import MCPServerListResponse
from src.services.mcp_registry_service import MCPRegistryService

router = APIRouter(prefix="/mcp", tags=["MCP"])


@router.get("/servers")
async def list_mcp_servers(
    registry: Annotated[MCPRegistryService, Depends(get_registry)],
) -> MCPServerListResponse:
    """List configured MCP servers and current availability checks."""
    return await registry.list_server_status()
