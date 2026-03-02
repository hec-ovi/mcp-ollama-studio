import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"

import { useChatSession } from "../../hooks/useChatSession"
import { useMcpServers } from "../../hooks/useMcpServers"
import { StudioChatPanel } from "./studio/StudioChatPanel"
import { StudioReasoningSidebar } from "./studio/StudioReasoningSidebar"
import { StudioToolsSidebar } from "./studio/StudioToolsSidebar"

const STARTER_PROMPTS = [
  "Use Time MCP and tell me current time in Tokyo and New York.",
  "Use Fetch MCP and summarize https://modelcontextprotocol.io in 4 bullets.",
  "Use DeepWiki MCP and explain this repo: langchain-ai/langgraph.",
]

export function ChatStudio() {
  const { data, isLoading } = useMcpServers()
  const { messages, traces, isRunning, error, sendMessage, clearConversation } =
    useChatSession()

  const [draft, setDraft] = useState("")
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [toolPanelOpen, setToolPanelOpen] = useState(true)
  const [tracePanelOpen, setTracePanelOpen] = useState(true)

  const availableServers = useMemo(() => data?.servers ?? [], [data])
  const enabledServerNames = useMemo(
    () => availableServers.filter((server) => server.enabled).map((server) => server.name),
    [availableServers],
  )
  const effectiveSelectedServers = useMemo(
    () => (selectedServers.length === 0 ? enabledServerNames : selectedServers),
    [enabledServerNames, selectedServers],
  )
  const chatViewportRef = useRef<HTMLElement | null>(null)
  const layoutStyles = useMemo(
    () =>
      ({
        "--left-panel": toolPanelOpen ? "18.5rem" : "3.8rem",
        "--right-panel": tracePanelOpen ? "20.5rem" : "3.8rem",
      }) as CSSProperties,
    [toolPanelOpen, tracePanelOpen],
  )

  const toggleServer = (name: string) => {
    setSelectedServers((previous) =>
      (previous.length === 0 ? enabledServerNames : previous).includes(name)
        ? (() => {
            const base = previous.length === 0 ? enabledServerNames : previous
            const next = base.filter((item) => item !== name)
            return next.length === 0 ? base : next
          })()
        : [...(previous.length === 0 ? enabledServerNames : previous), name],
    )
  }

  const onSubmit = async () => {
    const trimmed = draft.trim()
    if (!trimmed || isRunning) {
      return
    }

    setDraft("")
    await sendMessage(trimmed, {
      stream: true,
      mcpServers: effectiveSelectedServers,
    })
  }

  useEffect(() => {
    const viewport = chatViewportRef.current
    if (!viewport) {
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: isRunning ? "smooth" : "auto",
      })
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [messages, traces, isRunning])

  return (
    <section
      style={layoutStyles}
      className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden px-3 py-3 lg:[grid-template-columns:var(--left-panel)_minmax(0,1fr)_var(--right-panel)] lg:transition-[grid-template-columns] lg:duration-300 lg:ease-out"
    >
      <StudioToolsSidebar
        isOpen={toolPanelOpen}
        isLoading={isLoading}
        availableServers={availableServers}
        selectedServers={effectiveSelectedServers}
        onToggle={() => setToolPanelOpen((previous) => !previous)}
        onToggleServer={toggleServer}
      />

      <StudioChatPanel
        chatViewportRef={chatViewportRef}
        messages={messages}
        draft={draft}
        starterPrompts={STARTER_PROMPTS}
        isRunning={isRunning}
        error={error}
        onSubmit={onSubmit}
        onClearConversation={clearConversation}
        onDraftChange={setDraft}
      />

      <StudioReasoningSidebar
        isOpen={tracePanelOpen}
        traces={traces}
        onToggle={() => setTracePanelOpen((previous) => !previous)}
      />
    </section>
  )
}
