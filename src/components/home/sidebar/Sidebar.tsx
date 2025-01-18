import { useState } from "react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`h-screen bg-gray-50 border-r transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold">ZeNote</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-200"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {!isCollapsed && (
              <>
                <li className="p-2 rounded-lg hover:bg-gray-200">Notes</li>
                <li className="p-2 rounded-lg hover:bg-gray-200">Templates</li>
                <li className="p-2 rounded-lg hover:bg-gray-200">Settings</li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}
