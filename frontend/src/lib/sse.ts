export interface SSEEvent {
  event: string | null
  data: string
}

export interface ParsedSSEChunk {
  events: SSEEvent[]
  remainder: string
}

export function parseSSEChunk(buffer: string): ParsedSSEChunk {
  const rawEvents = buffer.split("\n\n")
  const incompleteTail = rawEvents.pop() ?? ""
  const events: SSEEvent[] = []

  for (const block of rawEvents) {
    let event: string | null = null
    const dataLines: string[] = []

    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim()
        continue
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim())
      }
    }

    if (dataLines.length > 0) {
      events.push({ event, data: dataLines.join("\n") })
    }
  }

  return { events, remainder: incompleteTail }
}
