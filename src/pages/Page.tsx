import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePage } from "@/hooks/usePage";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "@/context/AuthContext";
import { Response } from "@/types";
import LoadingCircle from "@/components/LoadingCircle";
import PageTitle from "@/components/home/page/PageTitle";
import BlockSection from "@/components/block/BlockSection";
import { BlockProps } from "@/types";
const Page = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const pageData = usePage(pageId!);
  const [title, setTitle] = useState("");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<BlockProps[]>([]);
  // Auto-save every 10 seconds
  useEffect(() => {
    if (!pageId) return;

    const interval = setInterval(async () => {
      try {
        await invoke("update_page", {
          pageId: pageId,
          userId: String(user?.id),
          title: title,
          parentPageId: pageData?.parent_page_id,
        });
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
      setIsLoading(true);
      const pageResponse: Response = await invoke("fetch_page", {
        pageId: pageId,
      });
      if (!pageResponse.data ){
        setIsLoading(false);
        return;
      }
      // now get blocks
      const blockResponse: Response = await invoke("fetch_blocks", {
        pageId: pageId,
      });
      console.log("Block response: ", blockResponse);
      //block data can be empty
      if (blockResponse.data){
        setBlocks(blockResponse.data);
      }

      setTitle(pageResponse.data.title);
      setIsLoading(false);
    };
    fetchPageData();
  }, [pageId]);


  if (isLoading) {
    return <div className="w-full">
      <LoadingCircle />
    </div>;
  }

  return (
    <div className="w-full  p-8 overflow-y-auto flex flex-col items-center rounded-xl ml-4 bg-white">
      <PageTitle title={title} setTitle={setTitle} />
      <BlockSection blocks={blocks} />
    </div>
  );
};

export default Page;
