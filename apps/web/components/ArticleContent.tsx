"use client";

import { useState, useEffect } from "react";
import { NotionRenderer } from "react-notion-x";
import "react-notion-x/src/styles.css";
import { ExtendedRecordMap } from "notion-types";
import { LoadingDots } from "@/ui/icons";

async function fetchArticle(id: string) {
  console.log("Fetching article", id);
  const response = await fetch(`/api/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }

  return response.json();
}

export default function ArticleContent({
  articleId,
  title,
  knowledgebaseId,
}: {
  articleId: string;
  title: string;
  knowledgebaseId: string;
}) {
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { recordMap } = await fetchArticle(articleId);
        setRecordMap(recordMap);
        console.log(recordMap);

        // Record visit
        await fetch("/api/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ knowledgebaseId, articleId }),
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [articleId, knowledgebaseId]);

  if (error) {
    return <div>Error loading article: {error}</div>;
  }

  const className =
    "mb-7 transform rounded-md bg-white px-4 pb-2 pt-4 shadow-lg sm:px-6 sm:py-5 dark:bg-[#111828]";

  if (!recordMap) {
    return (
      <div className={`${className} h-96`}>
        <div className="flex h-full items-center justify-center">
          <LoadingDots />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-7 transform rounded-md bg-white px-4 pb-2 pt-4 shadow-lg sm:px-6 sm:py-5 dark:bg-[#111828]">
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold dark:text-white">{title}</h1>
        <div className="mx-auto w-full">
          {recordMap && (
            <NotionRenderer
              recordMap={recordMap}
              fullPage={false}
              darkMode={false}
              className="w-full max-w-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
