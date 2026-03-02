import { type KeyboardEvent, type RefObject } from "react"
import { LoaderCircle, SendHorizontal, Trash2 } from "lucide-react"

import type { ChatMessage } from "../../../types/chat"
import { AssistantMessage } from "../../ui/AssistantMessage"

interface StudioChatPanelProps {
  chatViewportRef: RefObject<HTMLElement | null>
  messages: ChatMessage[]
  starterPrompts: string[]
  draft: string
  streamEnabled: boolean
  selectedServersCount: number
  isRunning: boolean
  error: string | null
  onSubmit: () => Promise<void>
  onClearConversation: () => void
  onDraftChange: (value: string) => void
  onStreamEnabledChange: (enabled: boolean) => void
}

export function StudioChatPanel({
  chatViewportRef,
  messages,
  starterPrompts,
  draft,
  streamEnabled,
  selectedServersCount,
  isRunning,
  error,
  onSubmit,
  onClearConversation,
  onDraftChange,
  onStreamEnabledChange,
}: StudioChatPanelProps) {
  const onPromptKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault()
      await onSubmit()
    }
  }

  return (
    <article className="h-full min-h-0 rounded-2xl border border-border/70 bg-panel/70 p-4 shadow-xl shadow-black/10">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Agent Console</h2>
          <p className="text-sm text-muted-foreground">
            Streaming completion with markdown output and trace-aware diagnostics.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearConversation}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-rose-400/50 hover:text-rose-300"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </header>

      <section
        ref={chatViewportRef}
        className="studio-scrollbar mb-4 h-[calc(100%-12.2rem)] min-h-0 space-y-3 overflow-y-auto rounded-xl border border-border/70 bg-background/60 p-3"
      >
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            Ask something that can prove MCP calls quickly, for example:
            <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/90">
              {starterPrompts.map((prompt) => (
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
            {message.role === "assistant" ? (
              <AssistantMessage content={message.content} />
            ) : (
              <p className="whitespace-pre-wrap">{message.content || "..."}</p>
            )}
          </article>
        ))}
      </section>

      <footer className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={streamEnabled}
              onChange={(event) => onStreamEnabledChange(event.target.checked)}
              className="accent-primary"
            />
            Streaming
          </label>

          <span className="text-xs text-muted-foreground">
            Active MCPs: {selectedServersCount || "all enabled"}
          </span>

          {isRunning && (
            <span className="inline-flex items-center gap-2 text-xs text-primary">
              <LoaderCircle size={13} className="animate-spin" />
              generating...
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onPromptKeyDown}
            placeholder="Ask the local MCP agent..."
            className="studio-scrollbar min-h-28 w-full resize-none rounded-2xl border border-border/70 bg-background/70 px-3 py-2 pr-16 text-sm outline-none transition focus:border-primary"
          />
          <button
            type="button"
            onClick={() => {
              void onSubmit()
            }}
            disabled={isRunning || !draft.trim()}
            className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="Send message"
            title="Send"
          >
            <SendHorizontal size={16} />
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
      </footer>
    </article>
  )
}
