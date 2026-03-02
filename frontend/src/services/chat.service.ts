import { parseSSEChunk } from "../lib/sse"
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatStreamHandlers,
  ReasoningStep,
} from "../types/chat"
import { getApiBaseUrl, requestJson } from "./api-client"

const CHAT_ENDPOINT = "/api/v1/chat/completions"

export async function createCompletion(
  payload: ChatCompletionRequest,
): Promise<ChatCompletionResponse> {
  return requestJson<ChatCompletionResponse>(CHAT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ ...payload, stream: false }),
  })
}

export async function streamCompletion(
  payload: ChatCompletionRequest,
  handlers: ChatStreamHandlers,
): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}${CHAT_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ ...payload, stream: true }),
  })

  if (!response.ok || !response.body) {
    const detail = await response.text()
    throw new Error(detail || `Streaming request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  const handleEvent = (eventName: string | null, data: string) => {
    if (data === "[DONE]") {
      handlers.onDone()
      return
    }

    if (eventName === "trace") {
      const trace = JSON.parse(data) as ReasoningStep
      handlers.onTrace(trace)
      return
    }

    if (eventName === "error") {
      handlers.onError(JSON.parse(data).message as string)
      return
    }

    const payloadChunk = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string } }>
    }
    const token = payloadChunk.choices?.[0]?.delta?.content
    if (token) {
      handlers.onToken(token)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const parsed = parseSSEChunk(buffer)
    buffer = parsed.remainder

    for (const event of parsed.events) {
      handleEvent(event.event, event.data)
    }
  }

  if (buffer.trim().length > 0) {
    const parsedTail = parseSSEChunk(`${buffer}\n\n`)
    for (const event of parsedTail.events) {
      handleEvent(event.event, event.data)
    }
  }
}
