import { useCallback, useState } from "react"

import {
  createCompletion,
  streamCompletion,
} from "../services/chat.service"
import type {
  ChatMessage,
  ChatCompletionRequest,
  ReasoningStep,
} from "../types/chat"

interface SendMessageOptions {
  stream: boolean
  mcpServers: string[]
}

interface ChatSessionResult {
  messages: ChatMessage[]
  traces: ReasoningStep[]
  isRunning: boolean
  error: string | null
  sendMessage: (content: string, options: SendMessageOptions) => Promise<boolean>
  clearConversation: () => void
}

export function useChatSession(): ChatSessionResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [traces, setTraces] = useState<ReasoningStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeTrailingEmptyAssistant = (items: ChatMessage[]): ChatMessage[] => {
    const last = items.at(-1)
    if (!last || last.role !== "assistant" || last.content.trim().length > 0) {
      return items
    }
    return items.slice(0, -1)
  }

  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions) => {
      if (!content.trim()) {
        return false
      }

      const userMessage: ChatMessage = { role: "user", content }
      const conversation = [...messages, userMessage]

      setMessages(conversation)
      setTraces([])
      setError(null)
      setIsRunning(true)

      const request: ChatCompletionRequest = {
        messages: conversation,
        mcp_servers: options.mcpServers,
      }

      try {
        if (options.stream) {
          let receivedToken = false
          let streamReportedError = false

          setMessages((previous) => [
            ...previous,
            { role: "assistant", content: "" },
          ])

          await streamCompletion(request, {
            onToken: (token) => {
              receivedToken = true
              setMessages((previous) => {
                const updated = [...previous]
                const last = updated.at(-1)
                if (!last || last.role !== "assistant") {
                  return previous
                }
                updated[updated.length - 1] = {
                  ...last,
                  content: `${last.content}${token}`,
                }
                return updated
              })
            },
            onTrace: (trace) => {
              setTraces((previous) => [...previous, trace])
            },
            onError: (streamError) => {
              streamReportedError = true
              setError(streamError)
            },
            onDone: () => undefined,
          })

          if (!receivedToken) {
            setMessages((previous) => removeTrailingEmptyAssistant(previous))
            if (!streamReportedError) {
              setError(
                "The agent finished without a visible answer. Try a narrower prompt or fewer MCP tools.",
              )
            }
          }
          return receivedToken && !streamReportedError
        }

        const response = await createCompletion(request)
        const answer = response.choices[0]?.message.content ?? ""

        setMessages((previous) => [
          ...previous,
          { role: "assistant", content: answer },
        ])
        setTraces(response.reasoning_trace)
        return answer.trim().length > 0
      } catch (err) {
        setMessages((previous) => removeTrailingEmptyAssistant(previous))
        setError(
          err instanceof Error
            ? err.message
            : "Unexpected error while generating completion.",
        )
        return false
      } finally {
        setIsRunning(false)
      }
    },
    [messages],
  )

  const clearConversation = useCallback(() => {
    setMessages([])
    setTraces([])
    setError(null)
    setIsRunning(false)
  }, [])

  return {
    messages,
    traces,
    isRunning,
    error,
    sendMessage,
    clearConversation,
  }
}
