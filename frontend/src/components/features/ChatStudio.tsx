import { useMemo, useState } from "react"
import { LoaderCircle, SendHorizontal, Trash2 } from "lucide-react"

import { useChatSession } from "../../hooks/useChatSession"
import { useMcpServers } from "../../hooks/useMcpServers"
import { StatusPill } from "../ui/StatusPill"

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

  const availableServers = useMemo(() => data?.servers ?? [], [data])

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

  return (
    <section className="grid gap-4 lg:grid-cols-[2.2fr,1fr]">
      <article className="rounded-2xl border border-border/70 bg-panel/70 p-4 shadow-xl shadow-black/10">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Agent Console</h2>
            <p className="text-sm text-muted-foreground">
              Completion endpoint with optional streaming and reasoning traces.
            </p>
          </div>
          <button
            type="button"
            onClick={clearConversation}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-rose-400/50 hover:text-rose-300"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </header>

        <section className="mb-4 h-[420px] space-y-3 overflow-y-auto rounded-xl border border-border/70 bg-background/60 p-3">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              Ask something that can prove MCP calls quickly, for example:
              <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/90">
                {STARTER_PROMPTS.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`rounded-xl border px-3 py-2 text-sm leading-relaxed ${
                message.role === "user"
                  ? "ml-6 border-primary/30 bg-primary/10"
                  : "mr-6 border-border/70 bg-background"
              }`}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {message.role}
              </p>
              <p className="whitespace-pre-wrap">{message.content || "..."}</p>
            </article>
          ))}
        </section>

        <footer className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={streamEnabled}
                onChange={(event) => setStreamEnabled(event.target.checked)}
                className="accent-primary"
              />
              Streaming
            </label>

            <span className="text-xs text-muted-foreground">
              Active MCPs: {selectedServers.length || "all enabled"}
            </span>

            {isRunning && (
              <span className="inline-flex items-center gap-2 text-xs text-primary">
                <LoaderCircle size={13} className="animate-spin" />
                generating...
              </span>
            )}
          </div>

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask the local MCP agent..."
            className="min-h-28 w-full resize-none rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm outline-none transition focus:border-primary"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isRunning || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <SendHorizontal size={15} />
              Send
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </footer>
      </article>

      <aside className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-panel/70 p-4">
          <h3 className="mb-3 font-display text-base font-semibold">Tool Selection</h3>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading MCP servers...</p>
          )}
          <ul className="space-y-2">
            {availableServers.map((server) => (
              <li
                key={server.name}
                className="rounded-xl border border-border/70 bg-background/65 p-2"
              >
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedServers.includes(server.name)}
                    onChange={() => toggleServer(server.name)}
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
        </article>

        <article className="rounded-2xl border border-border/70 bg-panel/70 p-4">
          <h3 className="mb-3 font-display text-base font-semibold">Reasoning Trace</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
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
        </article>
      </aside>
    </section>
  )
}
