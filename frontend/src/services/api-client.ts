const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() || "http://localhost:8000"

export function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, "")
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}
