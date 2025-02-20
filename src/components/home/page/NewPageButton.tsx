import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

const NewPageButton = () => {
  const navigate = useNavigate();

  const handleCreatePage = () => {
    const newPageId = uuidv4();
    navigate(`/${newPageId}`);
  };

  return (
    <button 
      className="relative min-w-36 min-h-36 rounded-2xl border-[1px] hover:border-gray-300 hover:shadow-md"
      onClick={handleCreatePage}
    >
      <div className="absolute top-0 left-0 right-0 h-[30%] bg-ze-light rounded-t-2xl"/>
      <div className="absolute top-[30px] left-7 border-[3px] rounded-lg w-6 h-6 flex items-center justify-center">
        <Plus className="text-[#37352f] opacity-25" size={20}/>
      </div>
      <p className="text-gray-400 mt-4 w-4/5 text-sm font-medium">
        New Page
      </p>
    </button>
  );
}

export default NewPageButton;
