import { Footer } from "./components/layout/Footer"
import { Header } from "./components/layout/Header"
import { MainContent } from "./components/layout/MainContent"
import { useApplyTheme } from "./hooks/useApplyTheme"

function App() {
  useApplyTheme()

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-a" />
        <div className="ambient-orb ambient-orb-b" />
        <div className="ambient-orb ambient-orb-c" />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,hsl(var(--background)/0.55),hsl(var(--background)/0.88)_55%,hsl(var(--background)/0.62))]" />
      </div>

      <div className="relative flex h-full w-full flex-col">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </div>
  )
}

export default App
