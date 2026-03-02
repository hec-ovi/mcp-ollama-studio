import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

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
  const traceViewportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const viewport = traceViewportRef.current
    if (!viewport) {
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "auto",
      })
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [isOpen, traces])

  return (
    <aside className="glass-widget flex h-full min-h-0 flex-col overflow-hidden p-2">
      <div className="mb-2 flex items-center justify-between px-2 py-1">
        {isOpen && <h3 className="font-display text-base font-semibold">Reasoning Trace</h3>}
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-background/55 text-muted-foreground transition hover:text-foreground dark:border-white/10 dark:bg-background/25"
          aria-label={isOpen ? "Collapse reasoning trace" : "Expand reasoning trace"}
          title={isOpen ? "Collapse reasoning trace" : "Expand reasoning trace"}
        >
          {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="trace-open"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={traceViewportRef}
            className="studio-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-1 pb-1"
          >
            {traces.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Trace events will appear here while the agent works.
              </p>
            )}
            {traces.map((trace, index) => (
              <div
                key={`${trace.node}-${trace.occurred_at}-${index}`}
                className="relative ml-3"
              >
                <article className="rounded-2xl border border-white/35 bg-background/58 p-2 shadow-[0_12px_24px_-20px_hsl(var(--foreground)/0.45)] dark:border-white/10 dark:bg-background/25">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {trace.node}
                  </p>
                  <p className="text-sm text-foreground/90">{trace.summary}</p>
                </article>
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-3 h-0 w-0 -translate-x-full border-y-[8px] border-y-transparent border-r-[10px] border-r-white/35 dark:border-r-white/10"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-[18px] h-0 w-0 -translate-x-full border-y-[6px] border-y-transparent border-r-[8px] border-r-background/58 dark:border-r-background/25"
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="trace-closed"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex min-h-0 flex-1 items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            {traces.length} trace{traces.length === 1 ? "" : "s"}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
