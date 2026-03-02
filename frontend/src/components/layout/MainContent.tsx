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

  return (
    <main className="mt-5 flex-1">
      <AnimatePresence mode="wait">
        <motion.section
          key={currentView}
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
