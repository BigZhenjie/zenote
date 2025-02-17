import { useNavigate } from "react-router-dom";
import { PageProps } from "@/types";
import { FileText } from "lucide-react";

const PageSquare = ({
  id,
  title,
  createdAt,
  updatedAt,
  userId,
  parentPageId,
}: PageProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${id}`);
  };

  return (
    <button 
      className="relative w-36 h-36 rounded-2xl border-[1px] hover:border-gray-300 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="absolute top-0 left-0 right-0 h-[30%] bg-ze-light rounded-t-2xl"/>
      <div className="absolute top-[30px] left-7 rounded-lg w-6 h-6 flex items-center justify-center">
        <FileText className="text-[#37352f] opacity-25" size={20}/>
      </div>
      <p className="text-gray-400 mt-4 w-4/5 text-sm font-medium">
        {title}
      </p>
    </button>
  );
};

export default PageSquare;
