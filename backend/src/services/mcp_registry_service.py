import asyncio
import json
import shutil
import sys
from pathlib import Path
from typing import Any

import httpx

from src.core.exceptions import MCPConfigurationError, MCPServerNotFoundError
from src.core.settings import Settings
from src.models.mcp import MCPServerConfig, MCPServerListResponse, MCPServerStatus, MCPTransport


class MCPRegistryService:
    """Loads configured MCP servers and resolves runtime subsets."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def _resolve_config_path(self) -> Path:
        """Resolve configured MCP catalog directory from settings."""
        config_dir = self._settings.mcp_catalog_dir
        if config_dir.is_absolute():
            return config_dir
        src_root = Path(__file__).resolve().parents[1]
        return src_root / config_dir

    def list_servers(self) -> list[MCPServerConfig]:
        """Load all server configurations from schema files."""
        config_dir = self._resolve_config_path()
        if not config_dir.exists():
            raise MCPConfigurationError(f"MCP catalog directory does not exist: {config_dir}")

        schema_files = sorted(config_dir.glob("*.json"))
        if not schema_files:
            raise MCPConfigurationError(f"MCP catalog is empty: {config_dir}")

        servers: list[MCPServerConfig] = []
        for file_path in schema_files:
            raw = file_path.read_text(encoding="utf-8")
            servers.append(MCPServerConfig.model_validate(json.loads(raw)))
        return servers

    def resolve_servers(self, requested_names: list[str] | None) -> list[MCPServerConfig]:
        """Return enabled servers or a requested subset."""
        configured = self.list_servers()
        enabled = [server for server in configured if server.enabled]

        if not requested_names:
            return enabled

        by_name = {server.name: server for server in enabled}
        missing = [name for name in requested_names if name not in by_name]
        if missing:
            missing_display = ", ".join(sorted(missing))
            raise MCPServerNotFoundError(
                f"Requested MCP servers are not enabled or configured: {missing_display}"
            )

        return [by_name[name] for name in requested_names]

    def to_client_config(self, servers: list[MCPServerConfig]) -> dict[str, dict[str, Any]]:
        """Convert validated server models to MultiServerMCPClient config."""
        config: dict[str, dict[str, Any]] = {}
        for server in servers:
            if server.transport == MCPTransport.STREAMABLE_HTTP and server.url is not None:
                config[server.name] = {
                    "transport": server.transport.value,
                    "url": str(server.url),
                }
                continue

            if server.transport == MCPTransport.STDIO and server.command is not None:
                command = self._resolve_stdio_command(server.command)
                config[server.name] = {
                    "transport": server.transport.value,
                    "command": command,
                    "args": server.args,
                    "env": server.env,
                }
                continue

            raise MCPConfigurationError(f"Invalid server config for '{server.name}'")

        return config

    async def list_server_status(self) -> MCPServerListResponse:
        """Return availability status for all configured servers."""
        servers = self.list_servers()
        statuses = await asyncio.gather(*(self._check_server(server) for server in servers))
        return MCPServerListResponse(servers=statuses)

    async def _check_server(self, server: MCPServerConfig) -> MCPServerStatus:
        """Run a lightweight availability check for one server."""
        if not server.enabled:
            return MCPServerStatus(
                name=server.name,
                label=server.label,
                description=server.description,
                instructions=server.instructions,
                transport=server.transport,
                enabled=False,
                available=False,
                detail="Disabled in configuration.",
            )

        if server.transport == MCPTransport.STREAMABLE_HTTP and server.url is not None:
            return await self._check_http_server(server)

        if server.transport == MCPTransport.STDIO and server.command is not None:
            return self._check_stdio_server(server)

        return MCPServerStatus(
            name=server.name,
            label=server.label,
            description=server.description,
            instructions=server.instructions,
            transport=server.transport,
            enabled=server.enabled,
            available=False,
            detail="Configuration is incomplete.",
        )

    async def _check_http_server(self, server: MCPServerConfig) -> MCPServerStatus:
        """Check availability of an HTTP MCP endpoint."""
        assert server.url is not None
        try:
            async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
                response = await client.get(str(server.url))
            available = response.status_code < 500
            detail = f"HTTP {response.status_code}"
        except httpx.HTTPError as exc:
            available = False
            detail = f"HTTP error: {exc.__class__.__name__}"

        return MCPServerStatus(
            name=server.name,
            label=server.label,
            description=server.description,
            instructions=server.instructions,
            transport=server.transport,
            enabled=server.enabled,
            available=available,
            detail=detail,
        )

    def _check_stdio_server(self, server: MCPServerConfig) -> MCPServerStatus:
        """Check availability of a local stdio server command."""
        assert server.command is not None

        resolved_command = self._resolve_stdio_command(server.command)
        command_available = shutil.which(resolved_command) is not None
        if not command_available:
            detail = f"Command not found in PATH: {resolved_command}"
            available = False
        else:
            detail = f"Command available: {resolved_command}"
            available = True

        return MCPServerStatus(
            name=server.name,
            label=server.label,
            description=server.description,
            instructions=server.instructions,
            transport=server.transport,
            enabled=server.enabled,
            available=available,
            detail=detail,
        )

    def _resolve_stdio_command(self, command: str) -> str:
        """Use the active interpreter for python-based stdio MCP servers."""
        if command in {"python", "python3"}:
            return sys.executable
        return command
