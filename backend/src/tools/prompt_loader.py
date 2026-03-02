from pathlib import Path


class PromptLoader:
    """Loads markdown prompts from disk."""

    def __init__(self, prompts_dir: Path) -> None:
        self._prompts_dir = prompts_dir

    def load(self, prompt_name: str) -> str:
        """Load a prompt file by name."""
        prompt_path = self._prompts_dir / prompt_name
        return prompt_path.read_text(encoding="utf-8").strip()
