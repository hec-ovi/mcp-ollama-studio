import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode = "system" | "light" | "dark"

interface ThemeStore {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  cycleMode: () => void
}

const MODES: ThemeMode[] = ["system", "light", "dark"]

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "system",
      setMode: (mode) => set({ mode }),
      cycleMode: () => {
        const current = get().mode
        const index = MODES.indexOf(current)
        const nextMode = MODES[(index + 1) % MODES.length]
        set({ mode: nextMode })
      },
    }),
    {
      name: "mcp-ollama-theme",
    },
  ),
)
