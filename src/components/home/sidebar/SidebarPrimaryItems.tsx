import SidebarItem from "./SidebarItem";
import { Search, Bot, House  } from "lucide-react";

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
  return (
    <div>
        {SidebarItems.map((item, index) => (
        <SidebarItem key={index} title={item.title} Icon={item.icon} path={item?.path} />
      ))}
    </div>
  )
}

export default SidebarPrimaryItems