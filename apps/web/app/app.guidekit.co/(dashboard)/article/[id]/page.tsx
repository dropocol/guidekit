"use client";

import { getSession } from "@/auth";
import { redirect, useRouter } from "next/navigation";
import * as React from "react";
import { NotionRenderer } from "react-notion-x";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ArticleSettingsSidebar from "@/components/ArticleSettingsSidebar";

async function fetchArticle(id: string) {
  const response = await fetch("/api/article", {
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

export default function ArticlePage({ params }: { params: { id: string } }) {
  const session = useSession();
  const router = useRouter();
  const [recordMap, setRecordMap] = useState(null);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const checkSessionAndFetchArticle = async () => {
      if (session.status === "unauthenticated") {
        router.push("/login");
      }

      const { recordMap, article } = await fetchArticle(params.id);
      setRecordMap(recordMap);
      setArticle(article);

      console.log("article", article);
      console.log("recordMap", recordMap);
    };

    checkSessionAndFetchArticle();
  }, [params.id, router, session]);

  if (!recordMap || !article) return <>Loading...</>;

  return (
    <div className="flex">
      <div className="w-full">
        <NotionRenderer
          recordMap={recordMap}
          fullPage={true}
          darkMode={false}
        />
      </div>
      <ArticleSettingsSidebar article={article} />
    </div>
  );
}
