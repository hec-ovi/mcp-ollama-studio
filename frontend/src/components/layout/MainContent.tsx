import { AnimatePresence, motion } from "framer-motion"

import { ChatStudio } from "../features/ChatStudio"

export function MainContent() {
  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.section
          key="studio"
          className="w-full min-h-0 flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ChatStudio />
        </motion.section>
      </AnimatePresence>
    </main>
  )
}
