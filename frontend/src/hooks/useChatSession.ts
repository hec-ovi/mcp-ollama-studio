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
  sendMessage: (content: string, options: SendMessageOptions) => Promise<void>
  clearConversation: () => void
}

export function useChatSession(): ChatSessionResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [traces, setTraces] = useState<ReasoningStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions) => {
      if (!content.trim()) {
        return
      }

      const userMessage: ChatMessage = { role: "user", content }
      const conversation = [...messages, userMessage]

      setMessages(conversation)
      setError(null)
      setIsRunning(true)

      const request: ChatCompletionRequest = {
        messages: conversation,
        mcp_servers: options.mcpServers,
      }

      try {
        if (options.stream) {
          setMessages((previous) => [
            ...previous,
            { role: "assistant", content: "" },
          ])

          await streamCompletion(request, {
            onToken: (token) => {
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
              setError(streamError)
            },
            onDone: () => {
              setIsRunning(false)
            },
          })
          return
        }

        const response = await createCompletion(request)
        const answer = response.choices[0]?.message.content ?? ""

        setMessages((previous) => [
          ...previous,
          { role: "assistant", content: answer },
        ])
        setTraces((previous) => [...previous, ...response.reasoning_trace])
        setIsRunning(false)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unexpected error while generating completion.",
        )
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
