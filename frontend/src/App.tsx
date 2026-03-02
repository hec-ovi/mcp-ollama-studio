import { Footer } from "./components/layout/Footer"
import { Header } from "./components/layout/Header"
import { MainContent } from "./components/layout/MainContent"
import { useApplyTheme } from "./hooks/useApplyTheme"
import { useNavigationStore } from "./stores/navigation.store"

function App() {
  useApplyTheme()
  const currentView = useNavigationStore((state) => state.currentView)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.2),transparent_35%),radial-gradient(circle_at_90%_0%,hsl(var(--accent)/0.18),transparent_40%),radial-gradient(circle_at_50%_100%,hsl(var(--secondary)/0.15),transparent_35%)]" />

      <div className="relative flex min-h-screen w-full flex-col px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4">
        <Header />
        <MainContent />
        {currentView !== "studio" && (
          <div className="mx-auto w-full max-w-6xl">
            <Footer />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
