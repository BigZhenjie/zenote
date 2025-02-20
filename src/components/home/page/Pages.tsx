import PageSquare from "./PageSquare";
import { useUserPages } from "@/hooks/userPages";
import NewPageButton from "./NewPageButton";
import { Clock3 } from "lucide-react";
import { User } from "@/types";
import LoadingCircle from "@/components/LoadingCircle";
const Pages = ({ user }: { user: User }) => {
  const {userPages, isLoading} = useUserPages(); // No need for isLoading anymore

  if (isLoading) {
    return <div className="w-full">
      <LoadingCircle />
    </div>;
  }

  return (
    <>
      <div className="flex gap-1 items-center mb-4">
        <Clock3 className="opacity-45" size={13} />
        <p className="text-xs font-semibold opacity-55">Recently Viewed</p>
      </div>
      <div className="flex gap-4 w-full overflow-x-auto">
        {userPages.map((page) => (
          <PageSquare key={page.id} {...page} profilePicUrl={user.avatarUrl} />
        ))}
        <NewPageButton />
        
      </div>
    </>
  );
};

export default Pages;