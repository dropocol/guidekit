import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getKnowledgebaseData } from "@/lib/fetchers";
import { KnowledgebaseWithCollections } from "@/lib/types";
import PublicKnowledgebaseView from "@/ui/knowledgebases/public-knowledgebase-view";

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
  const domain = params.domain;
  const data = await getKnowledgebaseData(domain);

  if (!data || !isValidKnowledgebase(data)) {
    notFound();
  }

  return <PublicKnowledgebaseView knowledgebase={data} />;
}

// Type guard function to validate the data structure
function isValidKnowledgebase(data: any): data is KnowledgebaseWithCollections {
  return data.collections.every(
    (collection: any) => collection.properties !== null,
  );
}
