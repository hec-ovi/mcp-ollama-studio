interface StatusPillProps {
  available: boolean
  label: string
}

export function StatusPill({ available, label }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        available
          ? "border-emerald-500/60 bg-emerald-200/85 !text-neutral-950 dark:border-emerald-400/60 dark:bg-emerald-400/15 dark:!text-emerald-200"
          : "border-rose-500/45 bg-rose-500/12 text-rose-800 dark:border-rose-400/60 dark:bg-rose-400/15 dark:text-rose-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available ? "bg-emerald-700 dark:bg-emerald-300" : "bg-rose-600 dark:bg-rose-300"
        }`}
      />
      {label}
    </span>
  )
}
