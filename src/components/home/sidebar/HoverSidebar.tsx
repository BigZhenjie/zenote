import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import SidebarHeader from "./SidebarHeader";
import SidebarItem from "./SidebarItem";
interface HoverSidebarProps {
  isHovered: boolean;
}

const hoverAnimation = (isHovered: boolean) => {
  return {
    initial: { x: -240 },
    animate: { x: isHovered ? 0 : -240 },
  };
};

const SidebarItems = [
  "Search",
  "Home",
  "Favorites",
  "Settings",
]

const HoverSidebar: React.FC<HoverSidebarProps> = ({ isHovered }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { user } = useAuth();

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <motion.aside
      className="fixed z-10 rounded-md bg-[#FFFFFF] p-2 px-3 top-14 shadow-md border-slate-300 w-60 h-[500px]"
      {...hoverAnimation(isHovered || isHovering)}
      transition={{ duration: 0.15 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader firstName={user?.firstName} avatarUrl={user?.avatarUrl} />
      {SidebarItems.map((item, index) => (
        <p>{item}</p>
      ))}
    </motion.aside>
  );
};

export default HoverSidebar;
