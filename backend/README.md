# Backend

FastAPI + LangGraph backend for MCP Ollama Studio.

## Features

- OpenAPI/Swagger/ReDoc docs
- MCP registry loaded from separated schema files
- Streaming chat completions with SSE
- Reasoning trace events
- OpenAI-compatible v1 LLM adapter

## Commands

```bash
UV_CACHE_DIR=/tmp/uv-cache uv sync --frozen
UV_CACHE_DIR=/tmp/uv-cache uv run ruff check src tests
UV_CACHE_DIR=/tmp/uv-cache uv run pytest -q
UV_CACHE_DIR=/tmp/uv-cache uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
