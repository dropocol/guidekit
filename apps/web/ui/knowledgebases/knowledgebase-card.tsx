"use client";

import { useState } from "react";
import Link from "next/link";
import BlurImage from "@/ui/cards/blur-image";
import { placeholderBlurhash, random } from "@/lib/utils";
import { Knowledgebase } from "@prisma/client";
import { BarChart, ExternalLink } from "lucide-react";

export default function KnowledgebaseCard({ data }: { data: Knowledgebase }) {
  const [imageError, setImageError] = useState(false);
  const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  const bgClasses = [
    "bg-gradient-to-r from-red-300 to-blue-300",
    "bg-gradient-to-r from-yellow-300 to-green-300",
    "bg-gradient-to-r from-blue-300 to-purple-300",
    "bg-gradient-to-r from-green-300 to-yellow-300",
    "bg-gradient-to-r from-purple-300 to-red-300",
    "bg-gradient-to-r from-indigo-300 to-pink-300",
  ];

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/knowledgebase/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <div className="relative h-44 overflow-hidden">
          {data.image && !imageError ? (
            <BlurImage
              alt={data.name ?? "Knowledgebase thumbnail"}
              width={500}
              height={500}
              className="h-auto w-full object-cover"
              src={data.image}
              placeholder="blur"
              blurDataURL={data.imageBlurhash || placeholderBlurhash}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`h-full w-full ${bgClasses[random(0, 5)]}`} />
          )}
        </div>
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <a
          href={`${
            process.env.NODE_ENV === "production" ? "https" : "http"
          }://${url}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 rounded-md bg-stone-100 px-2 py-1 text-sm text-stone-600 transition-all hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          <ExternalLink className="h-4 w-4" />
          <p>{url}</p>
        </a>
        <div className="flex items-center space-x-1 rounded-md bg-stone-100 px-2 py-1 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          <BarChart className="h-4 w-4" />
          <p>{data.articleCount}</p>
        </div>
      </div>
    </div>
  );
}
