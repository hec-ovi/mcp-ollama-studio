import { ChevronLeft, ChevronRight } from "lucide-react"

import type { ReasoningStep } from "../../../types/chat"

interface StudioReasoningSidebarProps {
  isOpen: boolean
  traces: ReasoningStep[]
  onToggle: () => void
}

export function StudioReasoningSidebar({
  isOpen,
  traces,
  onToggle,
}: StudioReasoningSidebarProps) {
  return (
    <aside className="h-full min-h-0 rounded-2xl border border-border/70 bg-panel/85 p-2 shadow-xl shadow-black/10">
      <div className="mb-2 flex items-center justify-between px-2 py-1">
        {isOpen && <h3 className="font-display text-base font-semibold">Reasoning Trace</h3>}
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:text-foreground"
          aria-label={isOpen ? "Collapse reasoning trace" : "Expand reasoning trace"}
          title={isOpen ? "Collapse reasoning trace" : "Expand reasoning trace"}
        >
          {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {isOpen ? (
        <div className="studio-scrollbar h-[calc(100%-2.8rem)] min-h-0 space-y-2 overflow-y-auto px-1 pb-1">
          {traces.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Trace events will appear here while the agent works.
            </p>
          )}
          {traces.map((trace, index) => (
            <article
              key={`${trace.node}-${trace.occurred_at}-${index}`}
              className="rounded-xl border border-border/70 bg-background/70 p-2"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {trace.node}
              </p>
              <p className="text-sm text-foreground/90">{trace.summary}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex h-[calc(100%-2.8rem)] items-center justify-center text-xs font-semibold text-muted-foreground">
          {traces.length} trace{traces.length === 1 ? "" : "s"}
        </div>
      )}
    </aside>
  )
}
