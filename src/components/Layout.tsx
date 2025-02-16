import React, {useState} from 'react';
import HoverSidebar from './home/sidebar/HoverSidebar'; // Placeholder import
import MenuButton from './ui/MenuButton'; // Placeholder import
import { useHover } from '../hooks/useHover'; // Placeholder import

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
    const [menuRef, isHoverMenu] = useHover();

  return (
    <div className="flex h-screen">
      <div className="absolute flex">
        <HoverSidebar
          isHovered={isHoverMenu}
          isCursorOnMenu={isCursorOnMenu}
          setIsCursorOnMenu={setIsCursorOnMenu}
        />
        <MenuButton
          menuRef={menuRef}
          isMenuOpen={isMenuOpen} // Placeholder value
          setIsMenuOpen={setIsMenuOpen} // Placeholder function
          isHoverMenu={isHoverMenu}
          isCursorOnMenu={isCursorOnMenu}
        />
      </div>
        {children}
    </div>
  );
};

export default Layout;
