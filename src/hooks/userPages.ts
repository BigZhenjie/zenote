import { Response } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { PageProps } from "@/types";
import { useAuth } from "@/context/AuthContext";
export const useUserPages = () => {
  const { user } = useAuth();
  const [userPages, setUserPages] = useState<[] | PageProps[]>([]);

  useEffect(() => {
    const fetchUserPages = async () => {
      if (!user) return;
      const response: Response = await invoke("fetch_pages", {
        userId: user.id
      });
      
      const pages = response.data ? response.data : [];
      console.log("pages", pages);
      setUserPages(pages); // Only setting userPages from the response
    };
    fetchUserPages();
  }, []);

  return userPages;
};
