import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { debounce } from "lodash";
import { BlockProps } from "@/types";
type OptionalBlockProps = {
  id?: string; //could be null because of new block
  created_at?: string;
  updated_at?: string;
  type?: string; //could be null because of new block
  order?: number;
  content?: string;
  pageId: string; //page id must be passed in
  parentBlockId?: string | null;
  index?: number;
  blocks: BlockProps[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>;
};

const Block = ({
  index,
  id,
  pageId,
  parentBlockId,
  content,
  type,
  order,
  blocks,
  setBlocks,
}: OptionalBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const updateContent = useCallback(
    (newContent: string) => {
      setBlocks(
        blocks.map((block) => {
          if (block.id === id) {
            return {
              ...block,
              content: newContent,
            };
          }
          return block;
        })
      );
    },
    [blocks, id]
  );

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((text) => {
      console.log("Updating in Supabase:", text);
      // Your Supabase update code here
      setIsTyping(false);
    }, 1000), // 1 second delay
    []
  );

  // Handle content changes
  useEffect(() => {
    if (content) {
      setIsTyping(true);
      debouncedUpdate(content);
    }
  }, [content, debouncedUpdate]);

  return (
    <div
      className="w-[80%] flex items-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <Plus size={30} className="hover:bg-gray-100 rounded-md p-1 absolute left-0 translate-x-[-100%]" />
      )}

      <input
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        type="text"
        className="w-full outline-none"
        placeholder={isFocused ? "Type your text here..." : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isTyping && <span className="text-xs text-gray-400">Saving...</span>}
    </div>
  );
};

export default Block;
