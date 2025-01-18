import Sidebar from "./sidebar/Sidebar";
import { Menu, ChevronsRight, ChevronsLeft } from "lucide-react";
import { useState } from "react";
import { useHover } from "../../hooks/useHover";
import { motion, AnimatePresence } from "motion/react";
import { iconAnimation } from "../../constants/animation";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuRef, isHoverMenu] = useHover();

  return (
    <div className="flex h-screen p-3">
      <motion.div 
        ref={menuRef}
        className="hover:bg-gray-200 cursor-pointer rounded-md p-1 relative h-8 w-8 flex items-center justify-center"
      >
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              key="chevLeft"
              {...iconAnimation}
              onClick={() => setIsMenuOpen(false)}
            >
              <ChevronsLeft />
            </motion.div>
          ) : isHoverMenu ? (
            <motion.div
              key="chevRight"
              {...iconAnimation}
              onClick={() => setIsMenuOpen(true)}
            >
              <ChevronsRight />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              {...iconAnimation}
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to ZeNote</h1>
        <p className="text-gray-600">Your personal note-taking space</p>
      </main>
    </div>
  );
}
