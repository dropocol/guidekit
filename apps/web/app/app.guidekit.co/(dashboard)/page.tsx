import { Suspense } from "react";
import Knowledgebases from "@/ui/knowledgebases/top-knowledgebases";
import OverviewStats from "@/ui/analytics/overview-stats";
import Articles from "@/ui/knowledgebases/articles";
import Link from "next/link";
import PlaceholderCard from "@/ui/cards/placeholder-card";
import OverviewSitesCTA from "@/ui/sites/overview-sites-cta";
import OverviewKnowledgebasesCTA from "@/ui/knowledgebases/overview-knowledgebases-cta";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/auth";

export default async function Overview() {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Overview
        </h1>
        <OverviewStats />
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Top Knowledgebases
          </h1>
          <Suspense fallback={null}>
            <OverviewKnowledgebasesCTA />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Knowledgebases limit={4} />
        </Suspense>
      </div>

      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Recent Articles
        </h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Articles limit={4} />
        </Suspense>
      </div>
    </div>
  );
}
