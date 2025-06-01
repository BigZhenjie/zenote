import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { usePage } from "@/hooks/usePage";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "@/context/AuthContext";
import { Response } from "@/types";
import LoadingCircle from "@/components/LoadingCircle";
import PageTitle from "@/components/home/page/PageTitle";
import BlockSection from "@/components/block/BlockSection";
import { BlockProps } from "@/types";
import { debounce } from "lodash";

const Page = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const pageData = usePage(pageId!);
  const [title, setTitle] = useState("");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<BlockProps[]>([]);
  console.log("Page component rendered or re-rendered. Initial/Current blocks:", blocks);

  const debouncedUpdate = useCallback(
    debounce(async (title) => {
      // Your Supabase update code here
      if (!user) return;
      try {
        await invoke("update_page", {
          pageId: pageId,
          userId: String(user.id),
          title: title,
          parentPageId: pageData?.parent_page_id,
        });
      } catch (error) {
        console.error("Failed to auto-save page:", error);
      }
    }, 1000), // 1 second delay
    [user, pageId, pageData] // Added dependencies
  );

  useEffect(() => {
    if (!pageId) return;

    if (title) {
      console.log("Title changed:", title);
      debouncedUpdate(title);
    }
  }, [title, debouncedUpdate, pageId]); // Added pageId as it's used in debouncedUpdate indirectly

  // Fetch page data on mount
  useEffect(() => {
    if (!pageId) {
      console.log("Page useEffect: No pageId, returning.");
      return;
    }
    console.log("Page useEffect: Fetching data for pageId:", pageId);

    const fetchPageData = async () => {
      setIsLoading(true);
      console.log("Page useEffect: fetchPageData started.");
      const pageResponse: Response = await invoke("fetch_page", {
        pageId: pageId,
      });
      console.log("Page useEffect: fetch_page response:", pageResponse);

      if (!pageResponse.data) {
        console.log("Page useEffect: No data in pageResponse. Assuming new page, initializing with one empty block.");
        // For a new page (or if page data fetch fails but we have a pageId), create one initial empty block.
        setBlocks([
          {
            id: "", // No ID for a new, unsaved block
            content: "",
            type: "text",
            order: 0,
            pageId: pageId, // pageId should be valid here
            parentBlockId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setTitle(""); // Set a default title for a new page or leave as is
        setIsLoading(false);
        console.log("Page useEffect: New page initialized. isLoading set to false.");
        return;
      }
      
      // Existing page logic:
      setTitle(pageResponse.data.title);
      console.log("Page useEffect: Setting title to:", pageResponse.data.title);

      const blockResponse: Response = await invoke("fetch_blocks", {
        pageId: pageId,
      });
      console.log("Page useEffect: fetch_blocks response (Block response):", blockResponse);
      
      if (blockResponse.data && Array.isArray(blockResponse.data) && blockResponse.data.length > 0) {
        console.log("Page useEffect: Setting blocks with data from fetch_blocks:", blockResponse.data);
        setBlocks(blockResponse.data);
      } else {
        // Existing page has no blocks, or fetch_blocks failed to return valid data
        console.log("Page useEffect: No blocks from fetch_blocks or data is not an array. Initializing with one empty block.");
        setBlocks([
          {
            id: "",
            content: "",
            type: "text",
            order: 0,
            pageId: pageId,
            parentBlockId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      
      setIsLoading(false);
      console.log("Page useEffect: fetchPageData finished for existing page. isLoading set to false.");
    };
    fetchPageData();
  }, [pageId]); // Only pageId as dependency

  useEffect(() => {
    console.log("Page: blocks state updated:", blocks);
  }, [blocks]);

  if (isLoading) {
    console.log("Page: Rendering LoadingCircle.");
    return (
      <div className="w-full">
        <LoadingCircle />
      </div>
    );
  }

  console.log("Page: Rendering main content. Passing blocks to BlockSection:", blocks);
  return (
    <div className="w-full  p-8 overflow-y-auto flex flex-col items-center rounded-xl ml-4 bg-white">
      <PageTitle title={title} setTitle={setTitle} />
      <BlockSection blocks={blocks} setBlocks={setBlocks} pageId={pageId!} />
    </div>
  );
};

export default Page;
