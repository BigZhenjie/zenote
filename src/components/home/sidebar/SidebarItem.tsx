import { SidebarItemProps } from "@/types";

const SidebarItem = ({ title, Icon, path }: SidebarItemProps) => {
  return (
    <div>
      <button className="w-full py-1 hover:bg-gray-100 rounded-md text-gray-600 flex items-center gap-3">
        <Icon size={20} />
        <p className="font-medium text-[14px]">{title}</p>
      </button>
    </div>
  );
};

export default SidebarItem;
