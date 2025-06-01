import { BlockProps } from "@/types";
import Block from "./Block";
import ImageBlock from "./ImageBlock";
import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Response } from "@/types";
import { v4 as uuidv4 } from "uuid";

const BlockSection = ({
  blocks,
  setBlocks,
  pageId,
}: {
  blocks: BlockProps[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>;
  pageId: string;
}) => {
  const isPastingImageRef = useRef(false); // Use ref to track pasting state
  const blocksRef = useRef(blocks); // Track latest blocks
  blocksRef.current = blocks;

  const lastPasteTimestampRef = useRef(0); // For deduplication
  console.log("blocks passed into BlockSection: ", blocks);
  // Ensure there is always one empty block at the end
  useEffect(() => {
    const shouldAddEmptyBlock = () => {
      if (blocks.length === 0) {
        return true; // Always add if no blocks
      }
      const lastBlock = blocks[blocks.length - 1];
      // Add if last block is saved (has ID) AND has actual content (not just whitespace)
      if (lastBlock.id && lastBlock.content && lastBlock.content.trim() !== "") {
        return true;
      }
      return false;
    };

    if (shouldAddEmptyBlock()) {
      setBlocks(prevBlocks => [
        ...prevBlocks,
        {
          id: "",
          content: "",
          type: "text",
          order: prevBlocks.length,
          pageId: pageId,
          parentBlockId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
    }
  }, [blocks, pageId, setBlocks]);

  useEffect(() => {
    const createImageBlock = async (bytes: Uint8Array) => {
      try {
        const filePath = await invoke("save_temp_file", {
          fileBytes: Array.from(bytes),
        });

        const response: { response: string; success: boolean } = await invoke(
          "upload_file",
          {
            bucket: "images",
            path: uuidv4(),
            filePath,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
            supabaseKey: import.meta.env.VITE_SUPABASE_API_KEY,
            deleteAfterUpload: true,
          }
        );

        const imagePath: string = JSON.parse(response.response).Key;
        const imageUrl =
          "https://gzliirrtmmdeumryfouh.supabase.co/storage/v1/object/public/" +
          imagePath +
          "?&height=auto&width=auto";

        const newBlockData = {
          content: imageUrl,
          pageId: pageId,
          blockType: "image",
          order: blocksRef.current.length - 1, // Insert before the empty block
          parentBlockId: null,
        };

        const create_response: Response = await invoke(
          "create_block",
          newBlockData
        );

        if (
          create_response &&
          create_response.data &&
          create_response.status === 200
        ) {
          const blockData = Array.isArray(create_response.data)
            ? create_response.data[0]
            : create_response.data;

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
            order: blocksRef.current.length - 1,
            content: imageUrl,
            pageId: pageId,
            parentBlockId: null,
          };

          // Create new block BEFORE the empty block
          setBlocks(prevBlocks => {
            const insertionIndex = prevBlocks.length > 0 
              ? prevBlocks.length - 1 
              : 0;

            return [
              ...prevBlocks.slice(0, insertionIndex),
              newBlock,
              ...prevBlocks.slice(insertionIndex)
            ];
          });
        }
      } catch (error) {
        console.error("Failed to create image block:", error);
      }
    };

    const handlePaste = async (event: ClipboardEvent) => {
      // Add immediate prevention for all paste events
      event.preventDefault();
      event.stopPropagation();
      
      const now = Date.now();
      if (now - lastPasteTimestampRef.current < 200 || isPastingImageRef.current) return;
      lastPasteTimestampRef.current = now;

      try {
        isPastingImageRef.current = true;
        const clipboardItems = await navigator.clipboard.read();

        for (const item of clipboardItems) {
          const imageType = item.types.find((type) => type.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            await createImageBlock(bytes);
            break;
          }
        }
      } catch (error) {
        console.error("Failed to process pasted content:", error);
      } finally {
        isPastingImageRef.current = false;
      }
    };

    document.addEventListener("paste", handlePaste, { capture: true });
    return () => document.removeEventListener("paste", handlePaste, { capture: true });
  }, [pageId, setBlocks]);

  return (
    <div className="w-full flex flex-col items-center">
      {blocks.map((block: BlockProps, index: number) => {
        if (block.type === "image") {
          return (
            <ImageBlock
              key={block.id || `img-${index}`}
              id={block.id}
              content={block.content}
              type={block.type}
              order={index} // Use index directly for order
              pageId={pageId}
              parentBlockId={block.parentBlockId}
              index={index}
              blocks={blocks}
              setBlocks={setBlocks}
            />
          );
        }
        return (
          <Block
            key={block.id || `block-${index}`}
            id={block.id}
            content={block.content}
            type={block.type}
            order={index} // Use index directly for order
            pageId={pageId}
            parentBlockId={block.parentBlockId}
            index={index}
            blocks={blocks}
            setBlocks={setBlocks}
            handlePasteInBlock={false} // Disable paste handling in Block
          />
        );
      })}
    </div>
  );
};

export default BlockSection;