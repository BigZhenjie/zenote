import SidebarItem from "./SidebarItem";
import { Search, Bot, House  } from "lucide-react";
import { useLocation } from "react-router-dom";

const SidebarItems = [
    {
      title: "Search",
      icon: Search
    },
    {
      title: "Home",
      icon: House,
      path:"/home"
    },
    {
      title: "Chat",
      icon: Bot,
      path:"/chat"
    }
  ]

const SidebarPrimaryItems = () => {
  const location = useLocation();
  return (
    <div>
      {SidebarItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <SidebarItem key={index} title={item.title} Icon={item.icon} path={item?.path} isActive={isActive} />
        );
      })}
    </div>
  )
}

export default SidebarPrimaryItems