import { Footer } from "./components/layout/Footer"
import { Header } from "./components/layout/Header"
import { MainContent } from "./components/layout/MainContent"
import { useApplyTheme } from "./hooks/useApplyTheme"

function App() {
  useApplyTheme()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.2),transparent_35%),radial-gradient(circle_at_90%_0%,hsl(var(--accent)/0.18),transparent_40%),radial-gradient(circle_at_50%_100%,hsl(var(--secondary)/0.15),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-4 pt-4 md:px-6">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </div>
  )
}

export default App
