import { Response } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { PageProps } from "@/types";
export const useUserPages = () => {
  const [userPages, setUserPages] = useState<[] | PageProps[]>([]);

  useEffect(() => {
    const fetchUserPages = async () => {
      const response: Response = await invoke("fetch_pages", {
        userId: "3584093910851357337"
      });
      const pages = response.data ? response.data : [];
      setUserPages(pages); // Only setting userPages from the response
    };
    fetchUserPages();
  }, []);

  return userPages;
};
