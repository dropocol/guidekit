import BlurImage from "@/ui/cards/blur-image";
import { placeholderBlurhash } from "@/lib/utils";
import Link from "next/link";
import {
  Article,
  SubCollection,
  Collection,
  Knowledgebase,
} from "@prisma/client";

type PostCardProps = {
  data: Article & {
    subCollection: SubCollection & {
      collection: Collection & {
        knowledgebase: Knowledgebase;
      };
    };
  };
};

export default function PostCard({ data }: PostCardProps) {
  const { subCollection, knowledgebaseId } = data;
  const { collection } = subCollection;
  const { knowledgebase } = collection;

  const domain =
    knowledgebase.customDomain ||
    `${knowledgebase.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  const url = `/${collection.slug}/${collection.id}/${data.slug}/${data.id}`;

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link href={url} className="flex flex-col overflow-hidden rounded-lg">
        <div className="relative h-44 overflow-hidden">
          <BlurImage
            alt={data.title || "Card thumbnail"}
            width={500}
            height={400}
            className="h-full object-cover"
            src={data.image || "/placeholder.png"}
            placeholder="blur"
            blurDataURL={placeholderBlurhash}
          />
        </div>
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.title}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full px-4">
        <a
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${domain}${url}`
              : `http://${knowledgebase.subdomain}.localhost:3000${url}`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {domain} ↗
        </a>
      </div>
    </div>
  );
}
