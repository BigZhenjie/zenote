import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { debounce } from "lodash";
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

const Block = ({
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
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  // Determine if this is a new block by checking if index equals blocks.length
  const isNewBlock = index === blocks.length;

  const updateContent = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);
      
      if (isNewBlock) {
        // Only create a new block if content is not empty
        if (newContent.trim() !== "") {
          // We don't update blocks array here - we'll do it after successful API call
          setIsTyping(true);
        }
      } else {
        // For existing blocks, update the content in the blocks array
        setBlocks(prevBlocks => 
          prevBlocks.map((block, idx) => {
            if (idx === index) {
              return {
                ...block,
                content: newContent,
              };
            }
            return block;
          })
        );
        setIsTyping(true);
      }
    },
    [isNewBlock, index, setBlocks]
  );

  // Debounced update function for database
  const debouncedUpdate = useCallback(
    debounce(async (content: string) => {
      try {
        if (isNewBlock) {
          // Only create if there's content
          if (content.trim() !== "") {
            console.log("Creating new block:", content);
            
            const newBlockData = {
              content: content,
              page_id: pageId,
              type: type || "text",
              order: blocks.length,
              parent_block_id: parentBlockId || null,
            };
            
            // Call your create_block API
            const response: Response = await invoke("create_block", {
              block: newBlockData
            });
            
            // Add the new block to the blocks array with the returned ID
            setBlocks(prevBlocks => [
              ...prevBlocks,
              { 
                ...newBlockData, 
                id: response.data.id, 
                created_at: response.data.created_at,
                updated_at: response.data.updated_at
              } as BlockProps
            ]);
          }
        } else {
          // Update existing block
          console.log("Updating block:", id, content);
          
          await invoke("update_block", {
            block: {
              id: id,
              content: content,
              page_id: pageId,
              type: type,
              order: order
            }
          });
        }
      } catch (error) {
        console.error(`Failed to ${isNewBlock ? 'create' : 'update'} block:`, error);
      } finally {
        setIsTyping(false);
      }
    }, 1000),
    [isNewBlock, id, pageId, type, order, blocks.length, parentBlockId]
  );

  // Trigger the debounced update when content changes
  useEffect(() => {
    if (localContent !== content) {
      debouncedUpdate(localContent);
    }
  }, [localContent, content, debouncedUpdate]);

  return (
    <div
      className="w-[80%] flex items-center relative mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered  && (
        <Plus size={30} className="hover:bg-gray-100 rounded-md p-1 absolute left-0 translate-x-[-100%]" />
      )}

      <input
        value={localContent}
        onChange={(e) => updateContent(e.target.value)}
        type="text"
        className="w-full outline-none row-auto hover:border-gray-200 focus:border-gray-300 transition-colors"
        placeholder={isFocused || isNewBlock ? "Type your text here..." : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isTyping && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
    </div>
  );
};

export default Block;