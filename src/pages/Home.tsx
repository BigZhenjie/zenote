import HoverSidebar from "@/components/home/sidebar/HoverSidebar";
import { useState } from "react";
import { useHover } from "@/hooks/useHover"; // Importing useHover hook
import { motion } from "motion/react";
import MenuButton from "@/components/ui/MenuButton";
import { useAuth } from "@/context/AuthContext";
import Pages from "@/components/home/page/Pages";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
  const [menuRef, isHoverMenu] = useHover();
  const { user } = useAuth();

  return (
    <div className="flex h-screen">

      <div className="flex">
        <HoverSidebar
          isHovered={isHoverMenu}
          isCursorOnMenu={isCursorOnMenu}
          setIsCursorOnMenu={setIsCursorOnMenu}
        />
        <MenuButton
          menuRef={menuRef}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isHoverMenu={isHoverMenu}
          isCursorOnMenu={isCursorOnMenu}
        />
      </div>


      <motion.main
        className="w-full p-8 overflow-y-auto flex flex-col rounded-xl ml-4 bg-white"
        initial={{ marginLeft: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-4xl font-medium mb-8 text-gray-800">
          Hi, {user?.firstName}!
        </h1>

        <Pages />
      </motion.main>
    </div>
  );
}
