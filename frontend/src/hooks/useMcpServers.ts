import { useQuery } from "@tanstack/react-query"

import { listMcpServers } from "../services/mcp.service"

export function useMcpServers() {
  return useQuery({
    queryKey: ["mcp-servers"],
    queryFn: listMcpServers,
    refetchInterval: 15000,
  })
}
