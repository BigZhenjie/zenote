import { BlockProps } from "@/types";
import Block from "./Block";


const BlockSection = ({ blocks, pageId }: { blocks: BlockProps[], pageId: string }) => {
  return (
    <div className="w-full flex justify-center">
      {blocks.map((block: BlockProps) => (
        <div key={block.id}>{block.type}</div>
      ))}
      {/* the lonely block is the new block*/}
      <Block blocks={blocks} pageId={pageId}/> 
    </div>
  );
};

export default BlockSection;
