import BlurImage from "@/ui/cards/blur-image";
import { placeholderBlurhash } from "@/lib/utils";
import Link from "next/link";
import {
  Article,
  SubCollection,
  Collection,
  Knowledgebase,
} from "@prisma/client";
import GradientCard from "@/ui/knowledgebases/gradient-card";
import { ExternalLink } from "lucide-react";

// type PostCardProps = {
//   data: Article & {
//     subCollection: SubCollection & {
//       collection: Collection & {
//         knowledgebase: Knowledgebase;
//       };
//     };
//   };
// };

type PostCardProps = {
  data: Article & {
    knowledgebase: Knowledgebase;
  };
};

export default function PostCard({ data }: PostCardProps) {
  const { knowledgebase } = data;

  const domain =
    knowledgebase.customDomain ||
    `${knowledgebase.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  const url = `/${data.slug}`;
  const editUrl = `/article/${data.id}`;

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link href={editUrl} className="flex flex-col overflow-hidden rounded-lg">
        <div className="relative h-20 w-full">
          <GradientCard className="rounded-t-lg" />
        </div>
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-base font-bold tracking-wide dark:text-white">
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
            process.env.NODE_ENV === "production"
              ? `https://${domain}${url}`
              : `http://${knowledgebase.subdomain}.localhost:3000${url}`
          }
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 rounded-md bg-stone-100 px-2 py-1 text-sm text-stone-600 transition-all hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          <ExternalLink className="h-4 w-4" />
          <p>{domain}</p>
        </a>
      </div>
    </div>
  );
}
