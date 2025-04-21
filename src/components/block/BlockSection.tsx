import { BlockProps } from "@/types";
import Block from "./Block";
import ImageBlock from "./ImageBlock";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Response } from "@/types";
const BlockSection = ({
  blocks,
  setBlocks,
  pageId,
}: {
  blocks: BlockProps[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>;
  pageId: string;
}) => {
  const [isPastingImage, setIsPastingImage] = useState(false);

  useEffect(() => {
    const createImageBlock = async (imageUrl: string) => {
      try {
        const newBlockData = {
          content: imageUrl,
          pageId: pageId,
          blockType: "image",
          order: blocks.length,
          parentBlockId: null,
        };

        const response: Response = await invoke("create_block", newBlockData);

        if (response && response.data && response.status === 200) {
          const blockData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          const newBlock: BlockProps = {
            id:
              typeof blockData === "object"
                ? blockData.id || ""
                : String(blockData),
            createdAt:
              typeof blockData === "object"
                ? blockData.created_at || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt:
              typeof blockData === "object"
                ? blockData.updated_at || new Date().toISOString()
                : new Date().toISOString(),
            type: "image",
            order: blocks.length,
            content: imageUrl,
            pageId: pageId,
            parentBlockId: "",
          };

          setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
        }
      } catch (error) {
        console.error("Failed to create image block:", error);
      }
    };

    const handleLegacyPaste = (event: ClipboardEvent) => {
      if (!event.clipboardData?.items) return;

      for (let i = 0; i < event.clipboardData.items.length; i++) {
        const item = event.clipboardData.items[i];

        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (!blob) continue;

          const url = URL.createObjectURL(blob);
          createImageBlock(url);
          break;
        }
      }
    };

    const handlePaste = async (event: ClipboardEvent) => {
      if (isPastingImage) return;

      try {
        if (navigator.clipboard) {
          setIsPastingImage(true);

          const clipboardItems = await navigator.clipboard.read();
          let hasImage = false;

          for (const item of clipboardItems) {
            const imageType = item.types.find((type) =>
              type.startsWith("image/")
            );

            if (imageType) {
              hasImage = true;
              const blob = await item.getType(imageType);
              const url = URL.createObjectURL(blob);

              await createImageBlock(url);
              break;
            }
          }
          if (!hasImage && event.clipboardData) {
            handleLegacyPaste(event);
          }
        }
      } catch (error) {
        console.error("Failed to process pasted content:", error);
      } finally {
        setIsPastingImage(false);
      }
    };
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [blocks.length, pageId, isPastingImage, setBlocks]);

  return (
    <div className="w-full flex flex-col items-center">
      {blocks.map((block: BlockProps, index: number) => (
        <Block
          key={block.id}
          id={block.id}
          content={block.content}
          type={block.type}
          order={block.order}
          pageId={pageId}
          parentBlockId={block.parentBlockId}
          index={index}
          blocks={blocks}
          setBlocks={setBlocks}
        />
      ))}

      {/* If you still want a "new block" at the end */}
      <Block
        key="new-block" // Unique key for the new block
        id={""} // No ID for new block
        pageId={pageId}
        blocks={blocks}
        setBlocks={setBlocks}
        // Add any defaults for a new block
        type="text"
        content=""
        order={blocks.length}
        index={blocks.length}
      />
    </div>
  );
};

export default BlockSection;
