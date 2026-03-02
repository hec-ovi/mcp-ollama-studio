export type ChatRole = "system" | "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatCompletionRequest {
  model?: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_steps?: number
  mcp_servers?: string[]
}

export interface ReasoningStep {
  node: string
  summary: string
  occurred_at: string
}

export interface ChatCompletionResponse {
  id: string
  object: "chat.completion"
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: "assistant"
      content: string
    }
    finish_reason: "stop"
  }>
  reasoning_trace: ReasoningStep[]
}

export interface ChatStreamHandlers {
  onToken: (token: string) => void
  onTrace: (trace: ReasoningStep) => void
  onError: (message: string) => void
  onDone: () => void
}
