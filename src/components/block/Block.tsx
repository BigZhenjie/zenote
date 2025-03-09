import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
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
  const [isSaved, setIsSaved] = useState(!!id);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  // Check both index and whether it's already been saved
  const isNewBlock = index === blocks.length && !isSaved;

  // Debounced update function for database
  const debouncedUpdate = useCallback(
    debounce(async (content: string) => {
      try {
        if (isNewBlock) {
          // Only create if there's content
          if (content.trim() !== "") {
            if (localContent !== "") {
              setIsTyping(true);
            }
            const newBlockData = {
              content: content,
              pageId: pageId,
              blockType: type || "text",
              order: blocks.length,
              parentBlockId: parentBlockId || null,
            };
            
            // Call create_block API
            const response: Response = await invoke("create_block", newBlockData);
            console.log("Response for creating block: ", response);
            
            // Mark block as saved to prevent repeating
            setIsSaved(true);
            
            // When setting blocks, convert blockType back to type
            setBlocks((prevBlocks) => [
              ...prevBlocks,
              {
                ...newBlockData,
                type: newBlockData.blockType,
                id: response.data,
                createdAt: response.data.created_at,
                updatedAt: response.data.updated_at,
              } as BlockProps,
            ]);

            console.log("newBlockData: ", newBlockData);
            setLocalContent("");
          }
        } else {
          // Update existing block - no change here
          console.log("Updating block:", id, content);

          setBlocks((prevBlocks) =>
            prevBlocks.map((block, idx) => {
              if (idx === index) {
                return {
                  ...block,
                  content: localContent,
                };
              }
              return block;
            })
          );

          await invoke("update_block", {
            blockId: id,
            content: content,
            pageId: pageId,
            blockType: type,
            order: order,
          });
        }
      } catch (error) {
        console.error(`Failed to ${isNewBlock ? "create" : "update"} block:`, error);
      } finally {
        setIsTyping(false);
      }
    }, 1000),
    [isNewBlock, isSaved, id, pageId, type, order, blocks.length, parentBlockId, setBlocks]
  );

  // Trigger the debounced update when content changes
// Trigger the debounced update when content changes
useEffect(() => {
  if (localContent !== content) {
    debouncedUpdate(localContent);
    return () => {
      debouncedUpdate.cancel(); // Cancel pending debounces on cleanup
    };
  }
}, [localContent, content, debouncedUpdate]);

  return (
    <div
      className="w-[80%] flex items-center relative mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <Plus
          size={30}
          className="hover:bg-gray-100 rounded-md p-1 absolute left-0 translate-x-[-100%]"
        />
      )}

      <input
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        type="text"
        className="w-full outline-none row-auto hover:border-gray-200 focus:border-gray-300 transition-colors"
        placeholder={isFocused || isNewBlock ? "Type your text here..." : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isTyping && (
        <span className="text-xs text-gray-400 ml-2">Saving...</span>
      )}
    </div>
  );
};

export default Block;
