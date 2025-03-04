import { SidebarItemProps } from "@/types";
import { useNavigate } from "react-router-dom";
const SidebarItem = ({ title, Icon, path, isActive }: SidebarItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };
  return (
    <div>
      <button className={`w-full py-1 px-2 hover:bg-gray-50 active:bg-gray-300 rounded-md text-gray-600 flex items-center gap-3 ${isActive ? 'bg-gray-50' : ''}` } onClick={handleClick}>
        <Icon size={20} />
        <p className="font-medium text-[14px]">{title}</p>
      </button>
    </div>
  );
};

export default SidebarItem;
