import { Cpu, Sparkles } from "lucide-react"

import { ThemeToggle } from "../ui/ThemeToggle"

export function Header() {
  return (
    <header className="z-40 shrink-0 border-b border-white/30 bg-background/45 px-4 py-3 backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-background/35">
      <nav className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-primary/15 text-primary shadow-[0_10px_28px_-18px_hsl(var(--primary)/0.85)] dark:border-white/10">
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
          <span className="hidden items-center gap-1 rounded-full border border-white/35 bg-background/40 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm md:inline-flex dark:border-white/10 dark:bg-background/20">
            <Sparkles size={13} />
            Streaming + Trace
          </span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
