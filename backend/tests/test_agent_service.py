from src.core.settings import Settings
from src.services.agent_service import AgentService


class _DummyRegistry:
    pass


def _service() -> AgentService:
    return AgentService(settings=Settings(), registry=_DummyRegistry())  # type: ignore[arg-type]


def test_sanitize_tool_preview_strips_fetch_wrapper() -> None:
    service = _service()
    raw = (
        "Content type text/plain; charset=utf-8 cannot be simplified to markdown, "
        "but here is the raw content:\n"
        "Contents of https://example.com:\n"
        "<p>Hello</p> World"
    )

    cleaned = service._sanitize_tool_preview(raw)

    assert "cannot be simplified to markdown" not in cleaned
    assert "Contents of https://example.com" not in cleaned
    assert cleaned == "Hello World"


def test_build_fallback_answer_uses_tool_findings() -> None:
    service = _service()

    fallback = service._build_fallback_answer(
        [
            "Tool 'fetch' responded: repo has FastAPI backend",
            "repo has FastAPI backend",
            "frontend uses React",
        ]
    )

    assert fallback is not None
    assert "### Key findings" in fallback
    assert "- repo has FastAPI backend" in fallback
    assert "- frontend uses React" in fallback
