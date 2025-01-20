import { useState } from "react";
import { motion } from "motion/react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);


  return (
    <motion.aside 
      className="h-screen bg-white border-r border-gray-200 flex flex-col"
      initial={{ x: 0 }}
      animate={{ 
        x: isOpen ? (isCollapsed ? 64 : 240) : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-2 border-b border-gray-200">
        {/* <button 
          className="w-full p-2 hover:bg-gray-100 rounded-md text-gray-600 flex items-center justify-center"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? '»' : '«'}
        </button> */}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <section className="p-2">
          <h3 className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Workspace
          </h3>
          <ul className="space-y-1">
            <li className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
              All Pages
            </li>
            <li className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
              Templates
            </li>
            <li className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
              Trash
            </li>
          </ul>
        </section>

        <section className="p-2">
          <h3 className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Favorites
          </h3>
          <ul className="space-y-1">
            <li className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
              Project Plan
            </li>
            <li className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
              Meeting Notes
            </li>
          </ul>
        </section>
      </nav>
    </motion.aside>
  );
}
