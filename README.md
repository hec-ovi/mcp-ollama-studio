# MCP Ollama Studio

Local-first MCP client stack designed for fast demos: a LangGraph agent backend, OpenAPI + ReDoc docs, and a polished frontend shell for streaming completions.

## Progress

- [x] Backend foundation (FastAPI + LangGraph + MCP adapters)
- [ ] Frontend polished shell and chat experience
- [ ] Docker compose orchestration
- [ ] Full runbook and demo scripts

## Backend Implemented

- FastAPI app with OpenAPI at `/openapi.json`, Swagger at `/docs`, ReDoc at `/redoc`
- Chat completion endpoint: `POST /api/v1/chat/completions`
  - `stream=false` returns JSON completion
  - `stream=true` returns SSE chunks + trace events
- MCP status endpoint: `GET /api/v1/mcp/servers`
- LangGraph + `langchain-mcp-adapters` tool orchestration
- OpenAI-compatible `v1` LLM adapter (default targets local Ollama `http://host.docker.internal:11434/v1`)

## MCP Servers (No Auth)

The backend loads MCP server schemas from `backend/src/core/mcp_servers/`:

- `01-deepwiki.json`
- `02-fetch.json`
- `03-time.json`

Each server has separated schema + usage instructions, so you can swap or add MCPs without editing service code.

## Quick Backend Dev Run

```bash
cd backend
UV_CACHE_DIR=/tmp/uv-cache uv sync --frozen
UV_CACHE_DIR=/tmp/uv-cache uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Tests

```bash
cd backend
UV_CACHE_DIR=/tmp/uv-cache uv run ruff check src tests
UV_CACHE_DIR=/tmp/uv-cache uv run pytest -q
```
