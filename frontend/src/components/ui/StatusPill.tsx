interface StatusPillProps {
  available: boolean
  label: string
}

export function StatusPill({ available, label }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        available
          ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
          : "border-rose-400/60 bg-rose-400/15 text-rose-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available ? "bg-emerald-300" : "bg-rose-300"
        }`}
      />
      {label}
    </span>
  )
}
