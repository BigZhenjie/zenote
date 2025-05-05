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
  const [isPastingImage, setIsPastingImage] = useState(false);
  const lastPasteTimestampRef = useRef(0); // For deduplication

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
          imagePath + "?&height=auto&width=auto";

        const newBlockData = {
          content: imageUrl,
          pageId: pageId,
          blockType: "image",
          order: blocks.length,
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
            order: blocks.length,
            content: imageUrl,
            pageId: pageId,
            parentBlockId: null,
          };

          setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
        }
      } catch (error) {
        console.error("Failed to create image block:", error);
      } finally {
        setIsPastingImage(false);
      }
    };

    const handlePaste = async (event: ClipboardEvent) => {
      const now = Date.now();
      if (now - lastPasteTimestampRef.current < 200) {
        return;
      }
      lastPasteTimestampRef.current = now;

      if (isPastingImage) {
        return;
      }

      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const imageType = item.types.find((type) => type.startsWith("image/"));
          if (imageType) {
            event.preventDefault();
            event.stopPropagation();

            setIsPastingImage(true);

            const blob = await item.getType(imageType);
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            await createImageBlock(bytes);
            break;
          }
        }
      } catch (error) {
        console.error("Failed to process pasted content:", error);
        setIsPastingImage(false);
      }
    };

    document.addEventListener("paste", handlePaste, { capture: true });

    return () => {
      document.removeEventListener("paste", handlePaste, { capture: true });
    };
  }, [blocks.length, pageId, isPastingImage, setBlocks]);

  return (
    <div className="w-full flex flex-col items-center">
      {blocks.map((block: BlockProps, index: number) => {
        if (block.type === "image") {
          return (
            <ImageBlock
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
          );
        }
        return (
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
            handlePasteInBlock={false} // Disable paste handling in Block
          />
        );
      })}

      <Block
        key="new-block"
        id={""}
        pageId={pageId}
        blocks={blocks}
        setBlocks={setBlocks}
        type="text"
        content=""
        order={blocks.length}
        index={blocks.length}
        handlePasteInBlock={false} // Disable paste handling in Block
      />
    </div>
  );
};

export default BlockSection;