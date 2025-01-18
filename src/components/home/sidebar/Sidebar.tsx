import { useState } from "react";
import { motion } from "motion/react";
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return <>sidrbar</>;
}
