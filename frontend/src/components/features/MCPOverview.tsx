import { useMcpServers } from "../../hooks/useMcpServers"
import { StatusPill } from "../ui/StatusPill"

export function MCPOverview() {
  const { data, isLoading, error } = useMcpServers()

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border/70 bg-panel/70 p-5 text-sm text-muted-foreground">
        Checking MCP servers...
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-400/50 bg-rose-400/10 p-5 text-sm text-rose-300">
        Failed to load MCP status.
      </section>
    )
  }

  const servers = data?.servers ?? []

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-xl font-semibold">MCP Stack Snapshot</h2>
        <p className="text-sm text-muted-foreground">
          Three no-auth MCPs optimized for quick live demos and validation.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {servers.map((server) => (
          <article
            key={server.name}
            className="rounded-2xl border border-border/70 bg-panel/70 p-4"
          >
            <header className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold">{server.label}</h3>
              <StatusPill
                available={server.available}
                label={server.available ? "ready" : "down"}
              />
            </header>

            <p className="mb-2 text-sm text-foreground/90">{server.description}</p>
            <p className="mb-3 text-xs text-muted-foreground">{server.instructions}</p>

            <dl className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Transport</dt>
                <dd>{server.transport}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Enabled</dt>
                <dd>{server.enabled ? "yes" : "no"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Detail</dt>
                <dd className="truncate">{server.detail}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
