import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  index: number;
  blocks: BlockProps[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>;
  handlePasteInBlock?: boolean;
};

// Create a global flag to track paste processing across components
// This is a simple but effective way to prevent duplicate handling
const pasteProcessingFlag = {
  processing: false,
  timestamp: 0
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
  handlePasteInBlock = true,
}: OptionalBlockProps) => {
  const [isSaved, setIsSaved] = useState(!!id);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [imageSrc, setImageSrc] = useState("");

  // Check both index and whether it's already been saved
  const isNewBlock = index === blocks.length && !isSaved;

  const handlePaste = async (event: React.ClipboardEvent) => {
    // Skip if paste handling is disabled for this block
    if (!handlePasteInBlock) {
      return;
    }
    
    // Skip if there's content in the block already
    if (localContent.trim() !== "") {
      return;
    }
    
    // Check global paste flag - if it's been less than 200ms since last paste, skip
    const now = Date.now();
    if (pasteProcessingFlag.processing || (now - pasteProcessingFlag.timestamp < 200)) {
      console.log("Skipping paste - already processing or too soon");
      return;
    }
    
    try {
      // Set the global flag
      pasteProcessingFlag.processing = true;
      pasteProcessingFlag.timestamp = now;
      
      // Stop event propagation
      event.stopPropagation();
      
      if (!navigator.clipboard) {
        console.error("Clipboard API not available");
        return;
      }

      // Try to read images from clipboard
      let hasHandledImage = false;
      try {
        const clipboardItems = await navigator.clipboard.read();
        
        for (const clipboardItem of clipboardItems) {
          const imageType = clipboardItem.types.find(type => type.startsWith('image/'));
          
          if (imageType) {
            // Process the image
            const blob = await clipboardItem.getType(imageType);
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
            hasHandledImage = true;
            break;
          }
        }
      } catch (clipboardErr) {
        console.warn("Modern clipboard API failed, trying fallback", clipboardErr);
      }
      
      // Fallback to older clipboard API if needed
      if (!hasHandledImage && event.clipboardData) {
        for (let i = 0; i < event.clipboardData.items.length; i++) {
          const item = event.clipboardData.items[i];
          
          if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const url = URL.createObjectURL(blob);
              setImageSrc(url);
              hasHandledImage = true;
              break;
            }
          }
        }
      }
      
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    } finally {
      // Clear the global flag after a short delay
      setTimeout(() => {
        pasteProcessingFlag.processing = false;
      }, 300);
    }
  };

  // Debounced update function for database
  const debouncedUpdate = useCallback(
    debounce(async (content: string) => {
      try {
        if (isNewBlock && content.trim() !== "") {
          console.log("Creating new block with content:", content);
          
          // Create new block
          const newBlockData = {
            content: content,
            pageId: pageId,
            blockType: type,
            order: blocks.length,
            parentBlockId: parentBlockId || null,
          };

          const response: Response = await invoke("create_block", newBlockData);

          if (response && response.data && response.status === 200) {
            const blockData = Array.isArray(response.data)
              ? response.data[0]
              : response.data;

            const newBlockId =
              typeof blockData === "object" ? blockData.id : String(blockData);

            // Update local state
            setIsSaved(true);
            setBlocks((prevBlocks) => [
              ...prevBlocks.slice(0, -1),
              {
                id: newBlockId,
                content: content,
                type: type,
                order: blocks.length - 1,
                pageId: pageId,
                parentBlockId: parentBlockId || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: "",
                content: "",
                type: "text",
                order: blocks.length,
                pageId: pageId,
                parentBlockId: parentBlockId || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ]);
          }
        } else if (id) {
          console.log("Updating existing block:", id);
          
          // Update existing block
          await invoke("update_block", {
            blockId: id,
            content: content,
            pageId: pageId,
            parentBlockId: parentBlockId || null,
            order: index,
            blockType: type,
          });

          // Update local state
          setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
              block.id === id ? { ...block, content: content } : block
            )
          );
        }
      } catch (error) {
        console.error("Failed to save block:", error);
      }
    }, 1000),
    [isNewBlock, isSaved, id, pageId, type, order, blocks.length, parentBlockId, setBlocks]
  );

  const deleteBlock = async (id: string) => {
    try {
      await invoke("delete_block", { blockId: id });
      setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };

  // Call debouncedUpdate when content changes
  useEffect(() => {
    if (localContent !== content) {
      console.log("Content changed, updating:", localContent);
      debouncedUpdate(localContent);
    }
    
    return () => {
      debouncedUpdate.cancel();
    };
  }, [localContent, content, debouncedUpdate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    setIsTyping(true);
  };

  return (
    <div
      className="w-[80%] flex items-center relative mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute left-0 translate-x-[-100%] flex justify-end">
          <Plus size={25} className="hover:bg-gray-100 rounded-md p-1" />
          {id && (
            <Trash2
              size={25}
              className="hover:bg-gray-100 rounded-md p-1"
              onClick={() => deleteBlock(id)}
            />
          )}
        </div>
      )}

      {imageSrc ? (
        <img src={imageSrc} alt="Pasted content" />
      ) : (
        <input
          value={localContent}
          onChange={handleChange}
          type="text"
          className="w-full outline-none row-auto hover:border-gray-200 focus:border-gray-300 transition-colors h-auto"
          placeholder={isFocused || isNewBlock ? "Type your text here..." : ""}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
        />
      )}
    </div>
  );
};

export default Block;