import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlurImage from "@/ui/cards/blur-image";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import BlogCard from "@/ui/cards/blog-card";
import { getPostsForSite, getSiteData } from "@/lib/fetchers";
import Image from "next/image";
import { getKnowledgebaseData } from "@/lib/fetchers";
import KnowledgebaseView from "@/ui/knowledgebases/knowledgebase-view";
import { KnowledgebaseWithCollections } from "@/lib/types";

export async function generateStaticParams() {
  const allKnowledgebases = await prisma.knowledgebase.findMany({
    select: {
      subdomain: true,
      customDomain: true,
    },
  });

  const allPaths = allKnowledgebases
    .flatMap(({ subdomain, customDomain }) => [
      subdomain && {
        domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      },
      customDomain && {
        domain: customDomain,
      },
    ])
    .filter(Boolean);

  return allPaths;
}

export default async function KnowledgebasePage({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const data = await getKnowledgebaseData(domain);

  console.log("data", data);
  console.log("Is Valid", isValidKnowledgebase(data));

  if (!data || !isValidKnowledgebase(data)) {
    // Add validation check
    console.log("Not Valid");
    notFound();
  }

  return <KnowledgebaseView knowledgebase={data} />;
}

// New type guard function to validate the data structure
function isValidKnowledgebase(data: any): data is KnowledgebaseWithCollections {
  return data.collections.every(
    (collection: any) => collection.properties !== null, // Ensure properties is not null
  );
}
