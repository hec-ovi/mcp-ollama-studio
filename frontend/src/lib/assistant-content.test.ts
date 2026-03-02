import { describe, expect, it } from "vitest"

import { parseAssistantContent } from "./assistant-content"

describe("parseAssistantContent", () => {
  it("extracts think tags and returns clean answer", () => {
    const parsed = parseAssistantContent(
      "<think>private reasoning</think>\n\nFinal answer with **markdown**",
    )

    expect(parsed.thinking).toBe("private reasoning")
    expect(parsed.answer).toBe("Final answer with **markdown**")
  })

  it("extracts thinking fences", () => {
    const parsed = parseAssistantContent(
      "```thinking\ninternal\nline 2\n```\n\nHello world",
    )

    expect(parsed.thinking).toBe("internal\nline 2")
    expect(parsed.answer).toBe("Hello world")
  })

  it("keeps normal text untouched", () => {
    const parsed = parseAssistantContent("Simple answer")

    expect(parsed.thinking).toBeNull()
    expect(parsed.answer).toBe("Simple answer")
  })
})
