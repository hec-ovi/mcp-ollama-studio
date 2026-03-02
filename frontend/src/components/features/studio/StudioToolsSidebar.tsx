import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import type { MCPServerStatus } from "../../../types/mcp"
import { StatusPill } from "../../ui/StatusPill"

interface StudioToolsSidebarProps {
  isOpen: boolean
  isLoading: boolean
  availableServers: MCPServerStatus[]
  selectedServers: string[]
  onToggle: () => void
  onToggleServer: (name: string) => void
}

export function StudioToolsSidebar({
  isOpen,
  isLoading,
  availableServers,
  selectedServers,
  onToggle,
  onToggleServer,
}: StudioToolsSidebarProps) {
  return (
    <aside className="h-full min-h-0 border-r border-border/75 bg-panel/90 p-2">
      <div className="mb-2 flex items-center justify-between px-2 py-1">
        {isOpen && <h3 className="font-display text-base font-semibold">Tool Selection</h3>}
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition hover:text-foreground"
          aria-label={isOpen ? "Collapse tool selection" : "Expand tool selection"}
          title={isOpen ? "Collapse tool selection" : "Expand tool selection"}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="tools-open"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="studio-scrollbar h-[calc(100%-2.8rem)] min-h-0 overflow-y-auto px-1 pb-1"
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Pick specific MCPs or leave all unchecked to use all enabled tools.
            </p>

            {isLoading && (
              <p className="mb-2 text-sm text-muted-foreground">Loading MCP servers...</p>
            )}

            <ul className="space-y-2">
              {availableServers.map((server) => (
                <li key={server.name} className="border border-border/70 bg-background/65 p-2">
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedServers.includes(server.name)}
                      onChange={() => onToggleServer(server.name)}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      <span className="mb-1 flex items-center gap-2">
                        <strong className="font-medium">{server.label}</strong>
                        <StatusPill
                          available={server.available}
                          label={server.available ? "online" : "offline"}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {server.description}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground/80">
                        {server.instructions}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="tools-closed"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex h-[calc(100%-2.8rem)] flex-col items-center justify-center gap-1 text-xs font-semibold text-muted-foreground"
          >
            <span>{selectedServers.length || "all"}</span>
            <span>tools</span>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
