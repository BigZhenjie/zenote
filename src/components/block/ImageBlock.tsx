import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { debounce} from "lodash";
import { BlockProps, Response } from "@/types";
import { invoke } from "@tauri-apps/api/core";
type OptionalBlockProps = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
  order?: number;
  content?: string;
  pageId: string;
  parentBlockId?: string | null;
  index: number; // Make index required to determine new vs existing block
  blocks: BlockProps[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>;
};

const ImageBlock = ({
  index,
  id,
  pageId,
  parentBlockId,
  content = "",
  type = "text",
  order,
  blocks,
  setBlocks,
}: OptionalBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const deleteBlock = async (id: string) => {
    try {
      await invoke("delete_block", { blockId: id });
      setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  }

  return (
    <div
      className="w-[80%] flex items-center relative mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute left-0 translate-x-[-100%] flex justify-end">
        <Plus
          size={25}
          className="hover:bg-gray-100 rounded-md p-1"
        />
        {id && <Trash2 
          size={25}
          className=" hover:bg-gray-100 rounded-md p-1"
          onClick={() => deleteBlock(id)}
        />}
      </div>
      )}

      <img src={content} alt="" />
      
    </div>
  );
};

export default ImageBlock;
