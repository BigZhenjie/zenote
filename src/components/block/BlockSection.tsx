import { BlockProps } from "@/types";
import Block from "./Block";


const BlockSection = ({ blocks, setBlocks, pageId }: { blocks: BlockProps[], setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>, pageId: string }) => {
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
          parentBlockId={block.parent_block_id}
          index={index}
          blocks={blocks}
          setBlocks={setBlocks}
        />
      ))}
      
      {/* If you still want a "new block" at the end */}
      <Block 
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
