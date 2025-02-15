import React from 'react';
import { useParams } from 'react-router-dom';

const Page = () => {
  const { pageId } = useParams<{ pageId: string }>();

  return (
    <div>
      <h1>Page ID: {pageId}</h1>
      <p>This is the content for the page with ID: {pageId}</p>
    </div>
  );
};

export default Page;
