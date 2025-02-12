import PageSquare from "./PageSquare";
import { useUserPages } from "@/hooks/userPages";
import NewPageButton from "./NewPageButton";
import { Clock3 } from "lucide-react";
const Pages = () => {
  const userPages = useUserPages();
  return (
    <>
      <div className="flex gap-1 items-center mb-4">
        <Clock3 className=" opacity-45" size={13}/>
        <p className="text-xs font-semibold opacity-55">Recently Viewed</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {userPages.map((page) => (
          <PageSquare key={page.id} {...page} />
        ))}
        <NewPageButton />
      </div>
    </>
  );
};

export default Pages;
