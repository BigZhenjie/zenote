import HoverSidebar from "@/components/home/sidebar/HoverSidebar";
import { useState } from "react";
import { useHover } from "@/hooks/useHover"; // Importing useHover hook
import { motion } from "motion/react";
import MenuButton from "@/components/ui/MenuButton";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
  const [menuRef, isHoverMenu] = useHover();

  return (
    <div className="flex h-screen">
      {/* Sidebar and Menu Button Container */}
      <div className="flex">
        <HoverSidebar isHovered={isHoverMenu} isCursorOnMenu={isCursorOnMenu} setIsCursorOnMenu={setIsCursorOnMenu} />
        
        <MenuButton 
          menuRef={menuRef} 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
          isHoverMenu={isHoverMenu} 
          isCursorOnMenu={isCursorOnMenu} 
        />
      </div>

      <motion.main
        className="flex-1 p-8 overflow-y-auto"
        initial={{ marginLeft: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-2xl font-bold mb-4">Welcome to ZeNote</h1>
        <p className="text-gray-600">Your personal note-taking space</p>
      </motion.main>
    </div>
  );
}

