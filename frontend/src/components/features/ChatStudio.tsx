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

  const [draft, setDraft] = useState(STARTER_PROMPTS[0])
  const [streamEnabled, setStreamEnabled] = useState(true)
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [toolPanelOpen, setToolPanelOpen] = useState(true)
  const [tracePanelOpen, setTracePanelOpen] = useState(true)

  const availableServers = useMemo(() => data?.servers ?? [], [data])
  const chatViewportRef = useRef<HTMLElement | null>(null)
  const layoutStyles = useMemo(
    () =>
      ({
        "--left-panel": toolPanelOpen ? "18rem" : "3.5rem",
        "--right-panel": tracePanelOpen ? "20rem" : "3.5rem",
      }) as CSSProperties,
    [toolPanelOpen, tracePanelOpen],
  )

  const toggleServer = (name: string) => {
    setSelectedServers((previous) =>
      previous.includes(name)
        ? previous.filter((item) => item !== name)
        : [...previous, name],
    )
  }

  const onSubmit = async () => {
    const trimmed = draft.trim()
    if (!trimmed || isRunning) {
      return
    }

    await sendMessage(trimmed, {
      stream: streamEnabled,
      mcpServers: selectedServers,
    })
    setDraft("")
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
      className="grid h-full min-h-0 grid-cols-1 gap-3 lg:[grid-template-columns:var(--left-panel)_minmax(0,1fr)_var(--right-panel)]"
    >
      <StudioToolsSidebar
        isOpen={toolPanelOpen}
        isLoading={isLoading}
        availableServers={availableServers}
        selectedServers={selectedServers}
        onToggle={() => setToolPanelOpen((previous) => !previous)}
        onToggleServer={toggleServer}
      />

      <StudioChatPanel
        chatViewportRef={chatViewportRef}
        messages={messages}
        draft={draft}
        starterPrompts={STARTER_PROMPTS}
        streamEnabled={streamEnabled}
        selectedServersCount={selectedServers.length}
        isRunning={isRunning}
        error={error}
        onSubmit={onSubmit}
        onClearConversation={clearConversation}
        onDraftChange={setDraft}
        onStreamEnabledChange={setStreamEnabled}
      />

      <StudioReasoningSidebar
        isOpen={tracePanelOpen}
        traces={traces}
        onToggle={() => setTracePanelOpen((previous) => !previous)}
      />
    </section>
  )
}
