from langchain_openai import ChatOpenAI

from src.core.settings import Settings


class LLMClientFactory:
    """Creates OpenAI-compatible chat model clients."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create(self, model_name: str, temperature: float) -> ChatOpenAI:
        """Build a chat model client with provider-agnostic v1 settings."""
        return ChatOpenAI(
            model=model_name,
            base_url=self._settings.llm_base_url,
            api_key=self._settings.llm_api_key,
            temperature=temperature,
            timeout=self._settings.llm_timeout_seconds,
        )
