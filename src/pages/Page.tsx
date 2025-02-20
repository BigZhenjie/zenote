import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePage } from "@/hooks/usePage";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "@/context/AuthContext";
import { Response } from "@/types";
const Page = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const pageData = usePage(pageId!);
  const [title, setTitle] = useState("");
  const { user } = useAuth();

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!pageId) return;

    const interval = setInterval(async () => {
      console.log("pageId: ", pageId);
      try {
        await invoke("update_page", {
          pageId: pageId,
          userId: String(user?.id),
          title: title,
          parentPageId: pageData?.parent_page_id,
        });
        console.log("Page auto-saved");
      } catch (error) {
        console.error("Failed to auto-save page:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [pageId, title, pageData?.parent_page_id]);

  // Fetch page data on mount
  useEffect(() => {
    if (!pageId) return;
    const fetchPageData = async () => {
      const response: Response = await invoke("fetch_page", {
        pageId: pageId,
      });
      if (!response.data ) return

      setTitle(response.data.title);
    };
    fetchPageData();
  }, [pageId]);

  return (
    <div className="w-full p-8 overflow-y-auto flex flex-col items-center rounded-xl ml-4 bg-white">
      <div className="max-w-[80%] w-[80%]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New page"
          spellCheck="false"
          className="mt-20 text-4xl p-2 outline-none font-bold placeholder:font-bold placeholder:opacity-40"
        ></input>
      </div>
    </div>
  );
};

export default Page;
