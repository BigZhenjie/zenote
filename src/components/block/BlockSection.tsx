import { BlockProps } from "@/types";
import TextBlock from "./TextBlock";

const BlockSection = ({ blocks }: { blocks: BlockProps[] }) => {
  return (
    <div className="w-full flex justify-center">
      {blocks.map((block: BlockProps) => (
        <div key={block.id}>{block.type}</div>
      ))}
      <TextBlock />
    </div>
  );
};

export default BlockSection;
