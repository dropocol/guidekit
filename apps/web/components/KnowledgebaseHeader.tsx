import React from "react";

interface KnowledgebaseSettingsHeaderProps {
  name: string;
  page: string;
  subdomain: string;
}

export default function KnowledgebaseSettingsHeader({
  page,
  name,
  subdomain,
}: KnowledgebaseSettingsHeaderProps) {
  const url = `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
      <h1 className="font-cal text-xl font-bold sm:text-3xl dark:text-white">
        {page} for {name}
      </h1>
      <a
        href={
          process.env.NEXT_PUBLIC_VERCEL_ENV
            ? `https://${url}`
            : `http://${subdomain}.localhost:3000`
        }
        target="_blank"
        rel="noreferrer"
        className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
      >
        {url} ↗
      </a>
    </div>
  );
}
