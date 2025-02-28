import { useNavigate } from "react-router-dom";
import { PageProps } from "@/types";
import { FileText } from "lucide-react";

const PageSquare = ({
  id,
  title,
  created_at,
  updated_at,
  user_id,
  parent_page_id,
  profilePicUrl,
}: PageProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${id}`);
  };

  const formatTimeSinceUpdate = () => {
    const now = new Date();
    const updated = new Date(updated_at);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / 60000);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <button 
      className="relative min-w-36 min-h-36 rounded-2xl border-[1px] hover:border-gray-300 hover:shadow-sm"
      onClick={handleClick}
    >
      <div className="absolute top-0 left-0 right-0 h-[30%] bg-ze-light rounded-t-2xl"/>
      <div className="absolute top-[30px] left-7 border-[3px] rounded-lg w-6 h-6 flex items-center justify-center">
        <FileText className="text-[#37352f] opacity-25" size={20}/>
      </div>
      <p className="text-gray-400 mt-4 w-4/5 text-sm font-medium">
        {title}
      </p>
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <img 
          src={profilePicUrl} 
          alt="Profile" 
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-xs text-gray-400">
          {formatTimeSinceUpdate()}
        </span>
      </div>
    </button>
  );
};

export default PageSquare;
