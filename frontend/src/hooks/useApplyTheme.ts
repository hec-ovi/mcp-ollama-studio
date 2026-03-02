import { useEffect } from "react"

import { useThemeStore } from "../stores/theme.store"

function resolveIsDark(mode: "system" | "light" | "dark") {
  if (mode === "dark") {
    return true
  }
  if (mode === "light") {
    return false
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function useApplyTheme() {
  const mode = useThemeStore((state) => state.mode)

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = () => {
      const isDark = resolveIsDark(mode)
      document.documentElement.classList.toggle("dark", isDark)
      document.documentElement.setAttribute("data-theme", mode)
    }

    applyTheme()

    if (mode !== "system") {
      return undefined
    }

    const listener = () => applyTheme()
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [mode])
}
