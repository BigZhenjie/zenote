import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarHeaderProps } from "@/types";



const SidebarHeader = ({avatarUrl, firstName}: SidebarHeaderProps) => {
  return (
    <div className="flex gap-2 items-center mb-10">
      <Avatar className="rounded-md w-5 h-5">
        <AvatarImage
          src={avatarUrl}
          alt="Avatar"
          className="object-cover"
        />
        <AvatarFallback>
            <div className=" w-full h-full bg-slate-200 flex justify-center items-center rounded-md">
                <small className=" font-medium">
                    {firstName?.charAt(0)}
                </small>
                
            </div>
        </AvatarFallback>
      </Avatar>
      <p className="text-sm font-medium">{firstName}'s ZeNote</p>
    </div>
  );
};

export default SidebarHeader;
