import { AnimatePresence, motion } from "framer-motion"

import { useNavigationStore } from "../../stores/navigation.store"
import { ChatStudio } from "../features/ChatStudio"
import { MCPOverview } from "../features/MCPOverview"

const VIEW_MAP = {
  studio: <ChatStudio />,
  servers: <MCPOverview />,
}

export function MainContent() {
  const currentView = useNavigationStore((state) => state.currentView)
  const isStudioView = currentView === "studio"

  return (
    <main className="mt-3 flex min-h-0 flex-1">
      <AnimatePresence mode="wait">
        <motion.section
          key={currentView}
          className={`w-full ${isStudioView ? "min-h-0 flex-1" : ""}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {VIEW_MAP[currentView]}
        </motion.section>
      </AnimatePresence>
    </main>
  )
}
