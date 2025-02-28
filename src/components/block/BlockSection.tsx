import { BlockProps } from "@/types";
import Block from "./Block";


const BlockSection = ({ blocks, setBlocks, pageId }: { blocks: BlockProps[], setBlocks: React.Dispatch<React.SetStateAction<BlockProps[]>>, pageId: string }) => {
  return (
    <div className="w-full flex justify-center">
      {blocks.map((block: BlockProps) => (
        <div key={block.id}>{block.type}</div>
      ))}
      {/* the lonely block is the new block*/}
      <Block blocks={blocks} pageId={pageId} setBlocks={setBlocks}/>
    </div>
  );
};

export default BlockSection;
