import { SidebarHeaderProps } from "@/types";

const SidebarHeader = ({ avatarUrl, firstName }: SidebarHeaderProps) => {
  return (
    <div className="flex gap-2 items-center">
      <div className=" w-5 h-5 bg-slate-200 flex justify-center items-center rounded-md"> 
        <small className=" font-medium">{firstName?.charAt(0)}</small>
      </div>
      <p className="text-sm font-medium">{firstName}'s ZeNote</p>
    </div>
  );
};

export default SidebarHeader;
