import { describe, expect, it } from "vitest"

import { parseSSEChunk } from "./sse"

describe("parseSSEChunk", () => {
  it("parses named and unnamed events", () => {
    const chunk = [
      "event: trace",
      'data: {"node":"agent"}',
      "",
      'data: {"choices":[{"delta":{"content":"hi"}}]}',
      "",
      "",
    ].join("\n")

    const parsed = parseSSEChunk(chunk)

    expect(parsed.events).toHaveLength(2)
    expect(parsed.events[0]).toEqual({
      event: "trace",
      data: '{"node":"agent"}',
    })
    expect(parsed.events[1].event).toBeNull()
    expect(parsed.remainder).toBe("")
  })

  it("keeps incomplete tails for next parse", () => {
    const parsed = parseSSEChunk('data: {"a":1}\n\ndata: {"b":2}')

    expect(parsed.events).toHaveLength(1)
    expect(parsed.remainder).toBe('data: {"b":2}')
  })
})
