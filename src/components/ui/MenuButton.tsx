import { Menu, ChevronsRight, ChevronsLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { iconAnimation } from "@/constants/animation";

interface MenuButtonProps {
  menuRef: React.RefObject<HTMLDivElement>;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isHoverMenu: boolean;
  isCursorOnMenu: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  menuRef,
  isMenuOpen,
  setIsMenuOpen,
  isHoverMenu,
  isCursorOnMenu,
}) => {
  return (
    <motion.div
      ref={menuRef}
      className="hover:bg-gray-200 cursor-pointer rounded-md p-1 relative h-8 w-8 flex items-center justify-center m-3"
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
        ) : isHoverMenu || isCursorOnMenu ? (
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
  );
};

export default MenuButton;
