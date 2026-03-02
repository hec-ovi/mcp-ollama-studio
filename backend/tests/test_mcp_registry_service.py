import json
from pathlib import Path

from src.core.settings import Settings
from src.services.mcp_registry_service import MCPRegistryService


def _write_config(path: Path) -> None:
    deepwiki = {
        "name": "deepwiki",
        "label": "DeepWiki",
        "description": "Remote knowledge",
        "instructions": "Use for repository answers",
        "transport": "streamable_http",
        "url": "https://mcp.deepwiki.com/mcp",
        "enabled": True,
    }
    time = {
        "name": "time",
        "label": "Time",
        "description": "Clock",
        "instructions": "Use for timezone checks",
        "transport": "stdio",
        "command": "python",
        "args": ["-m", "mcp_server_time"],
        "enabled": True,
    }
    (path / "01-deepwiki.json").write_text(json.dumps(deepwiki), encoding="utf-8")
    (path / "02-time.json").write_text(json.dumps(time), encoding="utf-8")


def test_resolve_servers_subset(tmp_path: Path) -> None:
    config = tmp_path / "servers"
    config.mkdir(parents=True)
    _write_config(config)

    settings = Settings(mcp_catalog_dir=config)
    service = MCPRegistryService(settings)

    resolved = service.resolve_servers(["time"])

    assert len(resolved) == 1
    assert resolved[0].name == "time"


def test_to_client_config_maps_transports(tmp_path: Path) -> None:
    config = tmp_path / "servers"
    config.mkdir(parents=True)
    _write_config(config)

    settings = Settings(mcp_catalog_dir=config)
    service = MCPRegistryService(settings)

    mapped = service.to_client_config(service.list_servers())

    assert mapped["deepwiki"]["transport"] == "streamable_http"
    assert mapped["time"]["transport"] == "stdio"
