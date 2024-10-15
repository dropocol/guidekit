"use client";

import React, { useEffect } from "react";
import { KnowledgebaseWithCollections } from "@/lib/types";
import Link from "next/link";

export default function PublicKnowledgebaseView({
  knowledgebase,
  children,
  breadcrumbs,
}: {
  knowledgebase: KnowledgebaseWithCollections;
  children: React.ReactNode;
  breadcrumbs: { name: string; href: string }[];
}) {
  // useEffect(() => {
  //   // Record visit when the component mounts
  //   fetch("/api/visit", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ knowledgebaseId: knowledgebase.id }),
  //   });
  // }, [knowledgebase.id]);

  return (
    <div className="flex min-h-screen flex-col bg-[#eaeef6]">
      <div
        className="flex h-[280px] flex-shrink-0 justify-center px-4 sm:h-[350px] xl:px-0"
        style={{
          background:
            "radial-gradient(rgb(40, 40, 40) 1.28205%, rgb(0, 0, 0) 94.8718%)",
        }}
      >
        <div className="flex h-full flex-col text-center">
          <div className="mt-8 flex justify-center">
            <div className="flex items-center justify-center overflow-hidden">
              {knowledgebase.logo && (
                <>
                  <Link
                    href="/"
                    className="flex h-auto max-h-16 w-full max-w-32 items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={knowledgebase.logo!}
                      alt={knowledgebase.name}
                      className="h-full w-auto"
                    />
                  </Link>
                  <div className="mx-3 h-8 w-px bg-white"></div>
                </>
              )}
              <div className="font-display flex justify-center self-center pb-0.5 pt-px text-center align-middle text-sm font-medium text-white sm:text-lg">
                {knowledgebase.name}
              </div>
            </div>
          </div>

          <div className="flex h-[75%] flex-col justify-center pb-12">
            <span className="text-xl font-normal tracking-wide text-white sm:text-3xl">
              How can we help? 👋
            </span>
          </div>
        </div>
      </div>
      <div className="helpsite-wrapper mx-auto mt-[-85px] w-full max-w-screen-lg flex-grow px-3 sm:-mt-28 sm:px-0">
        <div className="-mt-26 mt-6 flex w-[98%] items-center justify-start overflow-hidden overflow-ellipsis whitespace-nowrap pl-2 pr-5 text-sm text-white opacity-75 sm:w-full sm:px-1">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon stroke-icon h-4"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              )}
              <Link
                href={crumb.href}
                className="font-medium text-white hover:text-white hover:underline"
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </div>
        <div className="mx-auto mt-3 w-full max-w-screen-lg">{children}</div>
      </div>
      {/* Footer content */}
    </div>
  );
}
