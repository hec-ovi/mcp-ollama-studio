import { MonitorCog, MoonStar, Sun } from "lucide-react"

import { useThemeStore } from "../../stores/theme.store"

const LABELS = {
  system: "System",
  light: "Light",
  dark: "Dark",
} as const

const ICONS = {
  system: MonitorCog,
  light: Sun,
  dark: MoonStar,
} as const

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode)
  const cycleMode = useThemeStore((state) => state.cycleMode)
  const Icon = ICONS[mode]

  return (
    <button
      type="button"
      onClick={cycleMode}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-panel/70 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
      aria-label="Cycle theme mode"
      title={`Theme: ${LABELS[mode]}`}
    >
      <Icon size={14} />
      {LABELS[mode]}
    </button>
  )
}
