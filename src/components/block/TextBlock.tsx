import React, { useState } from 'react'
import { Plus } from 'lucide-react'

const TextBlock = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div 
      className='w-[80%] flex items-center'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='w-8 h-8 mr-2 flex items-center justify-center'>
        {isHovered && <Plus size={30} className=' hover:bg-gray-100 rounded-md p-1' />}
      </div>
      <input 
        type="text" 
        className='w-full outline-none'
        placeholder={isFocused ? "Type your text here..." : ""} 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}

export default TextBlock