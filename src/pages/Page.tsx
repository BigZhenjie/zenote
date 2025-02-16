import React, { useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import { usePage } from "@/hooks/usePage"
import { PageProps } from "@/types"
import { invoke } from "@tauri-apps/api/core";

const Page = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const pageData = usePage(pageId!)
  const [title, setTitle] = useState("");

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!pageId) return;

    const interval = setInterval(async () => {
      try {
        await invoke("update_page", {
          pageId,
          title,
          parent_page_id: pageData?.parentPageId || null
        });
        console.log("Page auto-saved");
      } catch (error) {
        console.error("Failed to auto-save page:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [pageId, title, pageData?.parentPageId]);
  
  return (
    <div className="w-full p-8 overflow-y-auto flex flex-col items-center rounded-xl ml-4 bg-white">
      <div className="max-w-[80%] w-[80%]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New page"
          className="mt-20 text-4xl p-2 outline-none font-bold placeholder:font-bold placeholder:opacity-40"
        ></input>
      </div>
    </div>
  );
};

export default Page;
