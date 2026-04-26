<h1 align="center">mcp-ollama-studio</h1>

<p align="center">
  <strong>Local-first MCP client studio: LangGraph ReAct agent behind OpenAI-compatible <code>/v1/chat/completions</code>, React Studio UI with a reasoning rail, Ollama on AMD ROCm.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Working-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/MCP-Native-7B3FA0" alt="MCP" />
  <img src="https://img.shields.io/badge/LangGraph-Agent-1C3D5A" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Ollama-111111?logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/AMD-ROCm-ED1C24?logo=amd&logoColor=white" alt="ROCm" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
</p>

---

## What this is

A three-container Docker Compose stack: a LangGraph ReAct agent backend (FastAPI), a React Studio frontend, and a local Ollama runtime on AMD ROCm. Default MCP servers wired in: DeepWiki (streamable HTTP), Fetch (stdio), and Time (stdio). The backend exposes OpenAI-compatible `/v1/chat/completions` so any OpenAI-compatible client can drive it; the frontend adds a tools rail and a reasoning rail with persistent trace history across turns.

## Current Stack

This repo currently runs **3 containers**:

1. `ollama` (ROCm image + mounted host models)
2. `backend` (FastAPI + LangGraph + MCP adapters)
3. `frontend` (React app served by Nginx)

## What Is Implemented

- LangGraph ReAct agent orchestration with MCP tools
- OpenAI-compatible completion endpoint (`/api/v1/chat/completions`)
- Streaming SSE with token chunks + `trace` events + `[DONE]`
- Stream safety guard: if no assistant tokens are produced, backend emits a fallback summary from tool findings (or `event: error` when no findings exist)
- MCP registry loaded from separated JSON schemas
- Stdio MCP runtime safety: `python` commands are resolved to the backend interpreter (`sys.executable`)
- Tool trace cleanup: noisy Fetch wrappers are normalized to readable snippets
- Default no-auth MCP set:
  - DeepWiki (streamable HTTP)
  - Fetch (stdio)
  - Time (stdio)
- Frontend Studio with:
  - full-height left tools rail
  - full-height center chat workspace
  - full-height right collapsible reasoning rail
  - markdown answer rendering
  - collapsible model thinking blocks
  - themed custom scrollbars
  - streaming auto-scroll
  - persistent reasoning trace history across turns
- OpenAPI docs, Swagger, ReDoc

## Repository Structure

```text
.
├── docker-compose.yml
├── .env.template
├── ollama/
│   ├── Dockerfile
│   └── entrypoint.sh
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── src/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── settings.py
│   │   │   └── mcp_servers/
│   │   │       ├── 01-deepwiki.json
│   │   │       ├── 02-fetch.json
│   │   │       └── 03-time.json
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── mcp.py
│   │   │   └── chat.py
│   │   ├── services/
│   │   │   ├── mcp_registry_service.py
│   │   │   ├── agent_service.py
│   │   │   └── chat_service.py
│   │   ├── models/
│   │   │   ├── mcp.py
│   │   │   └── chat.py
│   │   ├── tools/
│   │   │   ├── llm_client_factory.py
│   │   │   └── prompt_loader.py
│   │   └── prompts/
│   │       └── system_prompt.md
│   └── tests/
│       ├── test_chat_service.py
│       ├── test_message_utils.py
│       └── test_mcp_registry_service.py
└── frontend/
    ├── Dockerfile
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── layout/
    │   │   ├── features/
    │   │   │   ├── ChatStudio.tsx
    │   │   │   └── studio/
    │   │   │       ├── StudioToolsSidebar.tsx
    │   │   │       ├── StudioChatPanel.tsx
    │   │   │       └── StudioReasoningSidebar.tsx
    │   │   └── ui/
    │   ├── services/
    │   ├── hooks/
    │   ├── lib/
    │   ├── stores/
    │   └── types/
    └── nginx.conf
```

## Inference + Agent Flow

`Frontend -> FastAPI /api/v1/chat/completions -> ChatService -> AgentService -> LangGraph create_react_agent -> MCP tools + ChatOpenAI-compatible model -> SSE back to frontend`

LLM adapter is provider-agnostic as long as endpoint is OpenAI-compatible (`/v1` semantics).

## API Endpoints

- `GET /health`
- `GET /api/v1/mcp/servers`
- `POST /api/v1/chat/completions`
  - `stream=false`: JSON response with `choices` + `reasoning_trace`
  - `stream=true`: `text/event-stream`
    - `event: trace` + JSON trace payload
    - `event: error` when the run completes without an assistant text answer
    - `data: {chat.completion.chunk}` token chunks
    - `data: [DONE]`

Docs:

- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## MCP Schema Catalog

Each MCP server config is defined in its own schema file under `backend/src/core/mcp_servers/`.

Each schema includes:

- identity (`name`, `label`)
- transport (`streamable_http` or `stdio`)
- runtime config (`url` or `command/args/env`)
- human-facing `instructions` used by the agent

## Environment

Copy and edit:

```bash
cp .env.template .env
```

Required values in this project:

- `OLLAMA_MODELS_DIR` (host path mount, example: `/home/hector/models/ollama`)
- `OLLAMA_MODEL`
- `LLM_BASE_URL` (default: `http://ollama:11434/v1`)
- `LLM_API_KEY` (default for local compose: `ollama`)
- `LLM_MODEL`
- `VITE_API_BASE_URL` (default: `http://localhost:8000`)

## Run (Docker Compose)

```bash
docker compose up --build
```

Service URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Ollama API: `http://localhost:11434`

## Dev Commands

Backend:

```bash
cd backend
UV_CACHE_DIR=/tmp/uv-cache uv sync --frozen
UV_CACHE_DIR=/tmp/uv-cache uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tests and Quality

Backend:

```bash
cd backend
UV_CACHE_DIR=/tmp/uv-cache uv run ruff check src tests
UV_CACHE_DIR=/tmp/uv-cache uv run pytest -q
```

Frontend:

```bash
cd frontend
npm run lint
npm run test
npm run build
```

## Demo Prompts

- `Use Time MCP and tell me current time in Tokyo and New York.`
- `Use Fetch MCP and summarize https://modelcontextprotocol.io in 4 bullets.`
- `Use DeepWiki MCP and explain this repo: langchain-ai/langgraph.`

## UI Validation Checklist

1. Open `http://localhost:5173`
2. Confirm the left tools rail is full-height and can collapse/expand
3. Confirm the right reasoning rail is full-height and can collapse/expand
4. Send a prompt and verify streaming tokens + trace events
5. Confirm the composer stays inside the center chat panel at all times
6. Verify footer links to `/docs`, `/redoc`, `/openapi.json`

---

## License

[MIT](LICENSE).
