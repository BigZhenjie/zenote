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
  const [imageSrc, setImageSrc] = useState('');

  const handlePaste = async (event) => {
    try {
      if (!navigator.clipboard) {
        console.error("Clipboard API not available");
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.find(type => type.startsWith('image/'));

        if (imageTypes) {
          const blob = await clipboardItem.getType(imageTypes);
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
          break; // Assuming we need the first image
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  // Check both index and whether it's already been saved
  const isNewBlock = index === blocks.length && !isSaved;

  // Debounced update function for database
  const debouncedUpdate = useCallback(
    debounce(async (content: string) => {
      try {
        if (isNewBlock) {
          // Only create if there's content
          if (content.trim() !== "") {
            setIsTyping(true);
            
            const newBlockData = {
              content: content,
              pageId: pageId,
              blockType: type || "text",
              order: blocks.length,
              parentBlockId: parentBlockId || null,
            };
            
            // Call create_block API
            const response: Response = await invoke("create_block", newBlockData);
            
            // Mark block as saved to prevent repeating
            setIsSaved(true);
            
            if (response.data && response.status === 200) {
              // Extract the first item if response.data is an array
              const blockData = Array.isArray(response.data) ? response.data[0] : response.data;
              // Create new block with correct structure
              const newBlock: BlockProps = {
                // Handle case where blockData is just the ID number
                id: typeof blockData === 'object' ? (blockData.id || "") : String(blockData),
                createdAt: typeof blockData === 'object' ? (blockData.created_at || new Date().toISOString()) : new Date().toISOString(),
                updatedAt: typeof blockData === 'object' ? (blockData.updated_at || new Date().toISOString()) : new Date().toISOString(),
                type: newBlockData.blockType,
                order: newBlockData.order,
                content: newBlockData.content,
                pageId: newBlockData.pageId,
                parentBlockId: newBlockData.parentBlockId || "",
              };
              
              // Add the new block to the state - important to use a callback to ensure we have the latest state
              setBlocks(prevBlocks => [...prevBlocks, newBlock]);
              
              // Reset local content for this component
              setLocalContent("");
              
              // Reset isSaved state to allow this component to create another block
              // This is crucial - without it the component won't recognize itself as a "new block" creator again
              setTimeout(() => {
                setIsSaved(false);
              }, 100);
            }
          }
        } else if (id) {
          // Update existing block
          await invoke("update_block", {
            blockId: id,
            content: content,
            pageId: pageId,
            parentBlockId: parentBlockId,
            order: order,
            blockType: type,
          });
          
          // Update the block in the state
          setBlocks(prevBlocks =>
            prevBlocks.map(block => 
              block.id === id 
                ? { ...block, content, updatedAt: new Date().toISOString() }
                : block
            )
          );
        }
      } catch (error) {
        console.error(`Failed to ${isNewBlock ? "create" : "update"} block:`, error);
      } finally {
        setIsTyping(false);
      }
    }, 1000),
    [isNewBlock, isSaved, id, pageId, type, order, blocks.length, parentBlockId]
  );

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
        <div className="absolute left-0 translate-x-[-100%] flex justify-end">
        <Plus
          size={25}
          className="hover:bg-gray-100 rounded-md p-1"
        />
        {id && <Trash2 
          size={25}
          className=" hover:bg-gray-100 rounded-md p-1"
        />}
      </div>
      )}

      {imageSrc ? (
        <img src={imageSrc} alt="Pasted content" />
      ) : (
        <input
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          type="text"
          className="w-full outline-none row-auto hover:border-gray-200 focus:border-gray-300 transition-colors h-auto"
          placeholder={isFocused || isNewBlock ? "Type your text here..." : ""}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
        />
      )}
      
      {/* {isTyping && (
        <span className="text-xs text-gray-400 ml-2">Saving...</span>
      )} */}
    </div>
  );
};

export default Block;
