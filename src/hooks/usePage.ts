import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Response } from "@/types";
import { PageProps } from "@/types"; // Import PageProps for type safety

export function usePage(pageId: string) {
  const [data, setData] = useState<PageProps | null>(null); // Set initial state to null
  const [error, setError] = useState<Error | null>(null); // Set error state to hold Error type
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const response: Response = await invoke("fetch_page", { pageId });
        if (isMounted) {
          if (response.status === 200) {
            console.log("Data fetched: ", response.data);
            setData(response.data ? response.data : {});
            
          } else {
            setError(new Error(response.error || "Failed to fetch page"));
          }
        }
      } catch (err) {
        if (isMounted) setError(err as Error); // Cast to Error type
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [pageId]);

  if (error) throw error;
  return data;
}
