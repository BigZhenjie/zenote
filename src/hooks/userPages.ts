import { Response } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { PageProps } from "@/types";
import { useAuth } from "@/context/AuthContext";
export const useUserPages = () => {
  const { user } = useAuth();
  const [userPages, setUserPages] = useState<[] | PageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserPages = async () => {
      setIsLoading(true);
      if (!user) {
        setIsLoading(false);
        return;
      }
      const response: Response = await invoke("fetch_pages", {
        userId: user.id,
      });

      const pages = response.data ? response.data : [];
      setUserPages(pages); // Only setting userPages from the response
      setIsLoading(false);
    };
    fetchUserPages();
  }, [user]);

  return {userPages, isLoading};
};
