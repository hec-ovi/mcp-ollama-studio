export interface ParsedAssistantContent {
  answer: string
  thinking: string | null
}

function collectPatternMatches(
  text: string,
  pattern: RegExp,
  collected: string[],
): string {
  return text.replace(pattern, (_match, thought: string) => {
    const normalized = thought.trim()
    if (normalized) {
      collected.push(normalized)
    }
    return ""
  })
}

export function parseAssistantContent(raw: string): ParsedAssistantContent {
  const thoughts: string[] = []

  let remaining = raw

  remaining = collectPatternMatches(
    remaining,
    /<think>([\s\S]*?)<\/think>/gi,
    thoughts,
  )

  remaining = collectPatternMatches(
    remaining,
    /```(?:thinking|reasoning)\s*([\s\S]*?)```/gi,
    thoughts,
  )

  const answer = remaining.trim()
  const thinking = thoughts.join("\n\n").trim()

  return {
    answer,
    thinking: thinking.length > 0 ? thinking : null,
  }
}
