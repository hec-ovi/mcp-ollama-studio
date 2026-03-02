export type MCPTransport = "streamable_http" | "stdio"

export interface MCPServerStatus {
  name: string
  label: string
  description: string
  instructions: string
  transport: MCPTransport
  enabled: boolean
  available: boolean
  detail: string
  checked_at: string
}

export interface MCPServerListResponse {
  servers: MCPServerStatus[]
}
