import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import CreateKnowledgebaseButton from "./create-knowledgebase-button";
import CreateKnowledgebaseModal from "../modal/create-knowledgebase";
import Link from "next/link";

export default async function OverviewKnowledgebasesCTA() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const knowledgebases = await prisma.knowledgebase.count({
    where: {
      userId: session.user?.id as string,
    },
  });

  return knowledgebases > 0 ? (
    <Link
      href="/knowledgebases"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      View All
    </Link>
  ) : (
    <CreateKnowledgebaseButton>
      <CreateKnowledgebaseModal />
    </CreateKnowledgebaseButton>
  );
}
