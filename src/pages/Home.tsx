import HoverSidebar from "@/components/home/sidebar/HoverSidebar";
import { useState } from "react";
import { useHover } from "@/hooks/useHover"; // Importing useHover hook
import { motion } from "motion/react";
import MenuButton from "@/components/ui/MenuButton";
import { useUserPages } from "@/hooks/userPages";
import { useAuth } from "@/context/AuthContext";
import PageSquare from "@/components/home/page/PageSquare";
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
  const [menuRef, isHoverMenu] = useHover();
  const userPages = useUserPages();
  const { user } = useAuth();
  return (
    <div className="flex h-screen">
      {/* Sidebar and Menu Button Container */}
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
        className="flex-1 p-8 overflow-y-auto flex items-center justify-center"
        initial={{ marginLeft: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-4xl font-medium self-start">
          Hi, {user?.firstName}!
        </h1>

        {/* layout all the dam pages */}
        {userPages.map((page) => (
          <PageSquare
            key={page.id}
            id={page.id}
            title={page.title}
            createdAt={page.createdAt}
            updatedAt={page.updatedAt}
            userId={page.userId}
            parentPageId={page.parentPageId}
          />
        ))}


      </motion.main>
    </div>
  );
}
