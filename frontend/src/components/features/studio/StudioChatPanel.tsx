import { type KeyboardEvent, type RefObject } from "react"
import { LoaderCircle, SendHorizontal, Trash2 } from "lucide-react"

import type { ChatMessage } from "../../../types/chat"
import { AssistantMessage } from "../../ui/AssistantMessage"

interface StudioChatPanelProps {
  chatViewportRef: RefObject<HTMLElement | null>
  messages: ChatMessage[]
  starterPrompts: string[]
  draft: string
  isRunning: boolean
  error: string | null
  onSubmit: () => Promise<void>
  onClearConversation: () => void
  onDraftChange: (value: string) => void
}

export function StudioChatPanel({
  chatViewportRef,
  messages,
  starterPrompts,
  draft,
  isRunning,
  error,
  onSubmit,
  onClearConversation,
  onDraftChange,
}: StudioChatPanelProps) {
  const onPromptKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      await onSubmit()
    }
  }

  return (
    <article className="flex h-full min-h-0 flex-col border-x border-border/75 bg-panel/72 p-4 md:px-5 md:py-4">
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
        className="studio-scrollbar mb-4 min-h-0 flex-1 space-y-3 overflow-y-auto border border-border/70 bg-background/60 p-3"
      >
        {messages.length === 0 && (
          <div className="border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            Ask something that can prove MCP calls quickly, for example:
            <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/90">
              {starterPrompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`relative max-w-[86%] ${
              message.role === "user" ? "ml-auto pr-3" : "mr-auto pl-3"
            }`}
          >
            <article
              className={`rounded-2xl border px-3 py-2 text-sm leading-relaxed ${
                message.role === "user"
                  ? "border-primary/30 bg-primary/10"
                  : "border-border/70 bg-background"
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
            <span
              aria-hidden
              className={`absolute top-3 h-3 w-3 rotate-45 border ${
                message.role === "user"
                  ? "right-1 border-b-0 border-l-0 border-primary/30 bg-primary/10"
                  : "left-1 border-r-0 border-t-0 border-border/70 bg-background"
              }`}
            />
          </div>
        ))}
      </section>

      <footer className="space-y-3">
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <LoaderCircle size={13} className="animate-spin" />
            generating...
          </div>
        )}

        <div className="relative flex h-12 items-center overflow-hidden rounded-r-3xl border border-border/70 bg-background/70">
          <input
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onPromptKeyDown}
            placeholder="Ask the local MCP agent..."
            className="h-full w-full bg-transparent px-3 pr-16 text-sm outline-none placeholder:text-muted-foreground/80"
          />
          <button
            type="button"
            onClick={() => {
              void onSubmit()
            }}
            disabled={isRunning || !draft.trim()}
            className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
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
