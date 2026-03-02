import { Cpu, Sparkles } from "lucide-react"

import { useNavigationStore } from "../../stores/navigation.store"
import type { AppView } from "../../stores/navigation.store"
import { ThemeToggle } from "../ui/ThemeToggle"

const NAV_ITEMS: Array<{ key: AppView; label: string }> = [
  { key: "studio", label: "Studio" },
  { key: "servers", label: "MCP Stack" },
]

export function Header() {
  const currentView = useNavigationStore((state) => state.currentView)
  const setView = useNavigationStore((state) => state.setView)

  return (
    <header className="sticky top-4 z-50 rounded-2xl border border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl">
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

        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-panel/70 p-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                currentView === item.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
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
