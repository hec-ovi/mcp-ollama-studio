import { getApiBaseUrl } from "../../services/api-client"

const year = new Date().getFullYear()

export function Footer() {
  const apiBase = getApiBaseUrl()

  return (
    <footer className="z-40 shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/30 bg-background/45 px-4 py-3 text-xs text-muted-foreground backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-background/35">
      <span>© {year} MCP Ollama Studio</span>
      <div className="flex items-center gap-3">
        <a
          href={`${apiBase}/docs`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          Swagger
        </a>
        <a
          href={`${apiBase}/redoc`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          ReDoc
        </a>
        <a
          href={`${apiBase}/openapi.json`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          OpenAPI
        </a>
      </div>
    </footer>
  )
}
