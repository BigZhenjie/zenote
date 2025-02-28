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
}

const Block = ({
  index,
  id,
  pageId,
  parentBlockId,
  content,
  type,
  order,
  blocks
}: OptionalBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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
      className="w-[80%] flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-8 h-8 mr-2 flex items-center justify-center">
        {isHovered && (
          <Plus size={30} className="hover:bg-gray-100 rounded-md p-1" />
        )}
      </div>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        type="text"
        className="w-full outline-none"
        placeholder={isFocused ? "Type your text here..." : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isTyping && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
    </div>
  );
};

export default Block;