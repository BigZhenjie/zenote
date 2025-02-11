import { PageProps } from "@/types";
const PageSquare = ({
  id,
  title,
  createdAt,
  updatedAt,
  userId,
  parentPageId,
}: PageProps) => {
  return <div>{title}</div>;
};

export default PageSquare;
