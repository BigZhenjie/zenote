import React from 'react'

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

const ImageBlock = ({
  index,
  id,
  pageId,
  parentBlockId,
  content,
  type = "text",
  order,
  blocks,
  setBlocks,
}: OptionalBlockProps) => {
  return (
    <div>
      <img src={content} alt="" />
    </div>
  )
}

export default ImageBlock