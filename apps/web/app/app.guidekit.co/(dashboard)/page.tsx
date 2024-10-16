import { Suspense } from "react";
import Knowledgebases from "@/ui/knowledgebases/top-knowledgebases";
import OverviewStats from "@/ui/analytics/overview-stats";
import Articles from "@/ui/knowledgebases/articles";
import Link from "next/link";
import PlaceholderCard from "@/ui/cards/placeholder-card";
import OverviewSitesCTA from "@/ui/sites/overview-sites-cta";
import OverviewKnowledgebasesCTA from "@/ui/knowledgebases/overview-knowledgebases-cta";
import DailyVisitsChart from "@/components/analytics/daily-visits-chart";
import TotalVisitors from "@/components/analytics/total-visitors";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/auth";

export default async function Overview() {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Overview
        </h1>
        <Suspense
          fallback={<div className="animate-pulse rounded-lg bg-gray-100" />}
        >
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2 flex flex-col justify-between gap-4 rounded-xl bg-stone-50 p-8">
              <div>
                <h2 className="text-lg font-medium">Total Visitors</h2>
                <p className="text-sm font-medium text-stone-500">
                  {new Date().toLocaleString("default", { month: "long" })}
                </p>
              </div>
              <TotalVisitors />
            </div>

            <div className="col-span-4 rounded-xl bg-stone-50 p-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">Daily Visits</h2>
                <DailyVisitsChart />
              </div>
            </div>
          </div>
        </Suspense>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Knowledgebases limit={3} />
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
