import HoverSidebar from "@/components/home/sidebar/HoverSidebar";
import { useState } from "react";
import { useHover } from "@/hooks/useHover"; // Importing useHover hook
import { motion } from "motion/react";
import MenuButton from "@/components/ui/MenuButton";
import { useUserPages } from "@/hooks/userPages";
import { useAuth } from "@/context/AuthContext";
import PageSquare from "@/components/home/page/PageSquare";
import NewPageButton from "@/components/home/page/NewPageButton";
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
  const [menuRef, isHoverMenu] = useHover();
  const userPages = useUserPages();
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {userPages.map((page) => (
            <PageSquare key={page.id} {...page} />
          ))}
          <NewPageButton />
        </div>
      </motion.main>
    </div>
  );
}
