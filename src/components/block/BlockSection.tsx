import { BlockProps } from '@/types'

const BlockSection = ({blocks}: {blocks: BlockProps[]}) => {
  return (
    blocks.map((block: BlockProps) => (
      <div key={block.id}>
        {block.type}
      </div>
    ))
  )
}

export default BlockSection