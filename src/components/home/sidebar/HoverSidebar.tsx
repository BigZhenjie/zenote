import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import SidebarHeader from "./SidebarHeader";
import SidebarPrimaryItems from "./SidebarPrimaryItems";
interface HoverSidebarProps {
  isHovered: boolean;
  isCursorOnMenu: boolean;
  setIsCursorOnMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const hoverAnimation = (isHovered: boolean) => {
  return {
    initial: { x: -240 },
    animate: { x: isHovered ? 0 : -240 },
  };
};

const HoverSidebar: React.FC<HoverSidebarProps> = ({ isHovered, isCursorOnMenu, setIsCursorOnMenu}) => {
  const { user } = useAuth();

  const handleMouseEnter = () => {
    setIsCursorOnMenu(true);
  };

  const handleMouseLeave = () => {
    setIsCursorOnMenu(false);
  };

  return (
    <motion.aside
      className="fixed z-10 rounded-md bg-[#FFFFFF] p-2 px-2 top-14 shadow-md border-slate-300 w-60 h-[500px] flex flex-col gap-4"
      {...hoverAnimation(isHovered || isCursorOnMenu)}
      transition={{ duration: 0.15 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader firstName={user?.firstName}/>
      <SidebarPrimaryItems />
    </motion.aside>
  );
};

export default HoverSidebar;
