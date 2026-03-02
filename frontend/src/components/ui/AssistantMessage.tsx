import { parseAssistantContent } from "../../lib/assistant-content"
import { MarkdownContent } from "./MarkdownContent"

interface AssistantMessageProps {
  content: string
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  const parsed = parseAssistantContent(content)

  return (
    <div className="space-y-3">
      {parsed.answer ? (
        <MarkdownContent content={parsed.answer} />
      ) : (
        <p className="text-muted-foreground">...</p>
      )}

      {parsed.thinking && (
        <details className="rounded-lg border border-border/70 bg-panel/60 p-2">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Thinking
          </summary>
          <div className="mt-2 border-t border-border/60 pt-2">
            <MarkdownContent content={parsed.thinking} />
          </div>
        </details>
      )}
    </div>
  )
}
