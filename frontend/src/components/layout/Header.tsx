import { Cpu, Sparkles } from "lucide-react"

import { ThemeToggle } from "../ui/ThemeToggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/88 px-4 py-3 backdrop-blur-xl md:px-6">
      <nav className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Cpu size={18} />
          </span>
          <div>
            <p className="font-display text-base font-semibold tracking-tight">
              MCP Ollama Studio
            </p>
            <p className="text-xs text-muted-foreground">
              Local agent + LangGraph + multi-MCP orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-panel px-3 py-2 text-xs text-muted-foreground md:inline-flex">
            <Sparkles size={13} />
            Streaming + Trace
          </span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
