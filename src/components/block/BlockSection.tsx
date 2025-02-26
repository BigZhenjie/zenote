import { BlockProps } from "@/types";
import NewBlock from "./NewBlock";

const BlockSection = ({ blocks }: { blocks: BlockProps[] }) => {
  return (
    <>
      {blocks.map((block: BlockProps) => (
        <div key={block.id}>{block.type}</div>
      ))}
      <NewBlock />
    </>
  );
};

export default BlockSection;
