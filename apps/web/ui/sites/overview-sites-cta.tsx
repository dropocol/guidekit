import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import CreateSiteButton from "./create-site-button";
import CreateSiteModal from "../modal/create-site";
import Link from "next/link";
import CreateKnowledgebaseModal from "../modal/create-knowledgebase";

export default async function OverviewSitesCTA() {
  const session = await getSession();
  if (!session) {
    return 0;
  }
  const sites = await prisma.knowledgebase.count({
    where: {
      userId: session.user?.id as string,
    },
  });

  return sites > 0 ? (
    <Link
      href="/knowledgebases"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      View All
    </Link>
  ) : (
    <CreateSiteButton>
      <CreateKnowledgebaseModal />
    </CreateSiteButton>
  );
}
