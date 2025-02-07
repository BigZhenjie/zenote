import { SidebarItemProps } from "@/types";

const SidebarItem = ({ title, Icon, path }: SidebarItemProps) => {
  return (
    <div>
      <button className="w-full p-2 hover:bg-gray-100 rounded-md text-gray-600 flex items-center gap-2">
        <Icon size={20} />
        {title}
      </button>
    </div>
  );
};

export default SidebarItem;
