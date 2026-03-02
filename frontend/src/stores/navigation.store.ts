import { create } from "zustand"

export type AppView = "studio" | "servers"

interface NavigationStore {
  currentView: AppView
  setView: (view: AppView) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentView: "studio",
  setView: (view) => set({ currentView: view }),
}))
