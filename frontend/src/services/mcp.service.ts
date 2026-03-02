import type { MCPServerListResponse } from "../types/mcp"
import { requestJson } from "./api-client"

const MCP_SERVERS_ENDPOINT = "/api/v1/mcp/servers"

export async function listMcpServers(): Promise<MCPServerListResponse> {
  return requestJson<MCPServerListResponse>(MCP_SERVERS_ENDPOINT)
}
