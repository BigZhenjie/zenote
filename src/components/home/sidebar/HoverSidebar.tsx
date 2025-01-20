import React, {useState} from "react";
import { motion } from "framer-motion";
interface HoverSidebarProps {
  isHovered: boolean;
}

const hoverAnimation = (isHovered: boolean) => {
  return {
    initial: { x: -200 },
    animate: { x: isHovered ? 0 : -200 },
  };
};

const HoverSidebar: React.FC<HoverSidebarProps> = ({ isHovered }) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <motion.aside
      className="fixed z-10 rounded-md bg-slate-50 p-4 top-14 shadow-md border-slate-300"
      {...hoverAnimation(isHovered || isHovering)}
      transition={{ duration: 0.25 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>Hover Sidebar</div>
    </motion.aside>
  );
};

export default HoverSidebar;
