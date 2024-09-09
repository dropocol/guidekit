import { Knowledgebase } from "@prisma/client";
import Link from "next/link";
import { Book } from "lucide-react";
import GradientCard from "./gradient-card";

export default function KnowledgebaseCard({ data }: { data: Knowledgebase }) {
  const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/knowledgebase/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <div className="relative h-44 w-full">
          <GradientCard className="rounded-t-lg" />
        </div>
        <div className="p-4">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.name}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <Link
          // href={`/knowledgebase/${data.id}`}
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${data.subdomain}.localhost:3000`
          }
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </Link>
        <div className="flex items-center rounded-md bg-blue-100 px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:bg-opacity-50 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:bg-opacity-50">
          <Book height={16} />
          {/* <p className="ml-1">{data._count?.articles || 0} articles</p> */}
          <p className="ml-1">{0} articles</p>
        </div>
      </div>
    </div>
  );
}
