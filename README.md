# MCP Ollama Studio

A local-first MCP client stack for demos and production-ready iteration.

- Backend: `FastAPI + LangGraph + langchain-mcp-adapters`
- Frontend: `React 19 + Tailwind v4 + Framer Motion + TanStack Query + Zustand`
- LLM adapter: **OpenAI-compatible `v1`** (default wired to in-compose Ollama ROCm)
- Docs: OpenAPI + Swagger + ReDoc
- Deployment: Docker Compose with separated frontend/backend services

## Why This Repo

This project is optimized for fast, credible demos:

- real MCP integration (no mock MCP behavior)
- streaming completions + reasoning trace feed
- easy provider switch via `.env` (in-compose Ollama, OpenAI-compatible endpoints, OpenRouter)
- polished UI with system/light/dark theme cycle

## MCP Servers Included (No Auth)

Schemas are separated by server under [`backend/src/core/mcp_servers`](backend/src/core/mcp_servers):

- `01-deepwiki.json`
- `02-fetch.json`
- `03-time.json`

Each schema contains:

- transport config (`streamable_http` or `stdio`)
- purpose/description
- explicit usage instructions for the agent

## Architecture

### Backend

`Route -> Service -> Tool`

- `GET /health`
- `GET /api/v1/mcp/servers`
- `POST /api/v1/chat/completions`
  - `stream=false`: JSON completion
  - `stream=true`: SSE chunks + `trace` events (ISO-8601 serialized timestamps)

Core backend modules:

- `backend/src/routes/`
- `backend/src/services/`
- `backend/src/models/`
- `backend/src/tools/`
- `backend/src/prompts/`

### Frontend

Single-page shell layout with full-height, responsive workspace sections:

- Sticky header with nav + theme toggle (system/light/dark)
- Studio view uses a **three-pane layout**:
  - left full-height MCP tool/server selection rail (independent sidebar component)
  - center full-height streaming chat workspace
  - right full-height **collapsible** reasoning trace rail (independent sidebar component)
- Markdown answers (tables/code/quotes) with styled rendering
- Collapsible `Thinking` section when model emits `<think>...</think>` or reasoning fences
- Auto-scroll while responses stream so the latest assistant output stays in view
- Custom themed scrollbars for chat and side rails (light/dark aware)
- MCP status dashboard
- Footer links to `/docs`, `/redoc`, `/openapi.json`

## LLM Provider Switching (OpenAI-Compatible v1)

The backend uses an OpenAI-compatible chat adapter.
Both streaming and non-streaming endpoints resolve the model from `LLM_MODEL` unless overridden per request.

Set these values in `.env`:

```bash
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

Examples:

- In-compose Ollama (default): `LLM_BASE_URL=http://ollama:11434/v1`
- OpenAI-compatible provider: set provider base URL + key
- OpenRouter: set OpenRouter base URL + key + model

## Environment Setup

```bash
cp .env.template .env
```

Main variables are documented in [`.env.template`](.env.template).
Make sure `OLLAMA_MODELS_DIR` points to your host models folder (for your setup: `/home/hector/models/ollama`).

## Local Dev

### Backend

```bash
cd backend
UV_CACHE_DIR=/tmp/uv-cache uv sync --frozen
# If running backend on host instead of compose:
# export LLM_BASE_URL=http://localhost:11434/v1
UV_CACHE_DIR=/tmp/uv-cache uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker Run

```bash
cp .env.template .env
mkdir -p /home/hector/models/ollama
docker compose up --build
```

Services:

- Ollama API: `http://localhost:11434`
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Validation Checklist

1. Open `http://localhost:5173`
2. Confirm MCP cards are visible and reporting status
3. In Studio, select MCP servers from the left rail and send a streaming prompt
4. Confirm chat auto-scrolls while streaming and reasoning trace appears on the right rail
5. Toggle the right rail collapse/expand control and verify trace persistence
6. Open backend docs at `/docs` and `/redoc`

## Demo Prompts

- `Use Time MCP and tell me current time in Tokyo and New York.`
- `Use Fetch MCP and summarize https://modelcontextprotocol.io in 4 bullets.`
- `Use DeepWiki MCP and explain this repo: langchain-ai/langgraph.`

## Tests

### Backend

```bash
cd backend
UV_CACHE_DIR=/tmp/uv-cache uv run ruff check src tests
UV_CACHE_DIR=/tmp/uv-cache uv run pytest -q
```

### Frontend

```bash
cd frontend
npm run lint
npm run test
npm run build
```
