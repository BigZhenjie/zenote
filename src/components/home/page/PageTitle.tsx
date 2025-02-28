import React from 'react'

const PageTitle = ({title, setTitle}: {title: string, setTitle: React.Dispatch<React.SetStateAction<string>>}) => {
  return (
    <div className="max-w-[80%] w-[80%] ">
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="New page"
      spellCheck="false"
      className="mt-20 text-4xl h-14 outline-none font-bold placeholder:font-bold placeholder:opacity-40"
    ></input>
  </div>
  )
}

export default PageTitle