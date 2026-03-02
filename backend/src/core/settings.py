from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "MCP Ollama Studio API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    cors_origins_raw: str = Field(
        default="http://localhost:5173,http://localhost:4173,http://localhost:3000",
        description="Comma-separated CORS origins.",
    )

    llm_base_url: str = Field(
        default="http://host.docker.internal:11434/v1",
        validation_alias=AliasChoices("LLM_BASE_URL", "OLLAMA_BASE_URL"),
        description="OpenAI-compatible base URL.",
    )
    llm_model: str = Field(
        default="qwen2.5:3b-instruct",
        validation_alias=AliasChoices("LLM_MODEL", "OLLAMA_MODEL"),
        description="Default model name used by the chat adapter.",
    )
    llm_api_key: str = Field(
        default="ollama",
        validation_alias=AliasChoices("LLM_API_KEY", "OPENAI_API_KEY"),
        description="API key for OpenAI-compatible providers.",
    )
    llm_temperature: float = 0.2
    llm_timeout_seconds: int = 120

    mcp_catalog_dir: Path = Path("core/mcp_servers")

    @property
    def cors_origins(self) -> list[str]:
        """Parse the configured CORS origins list."""
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()
