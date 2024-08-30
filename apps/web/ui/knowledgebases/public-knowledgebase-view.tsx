import React from "react";
import { KnowledgebaseWithCollections } from "@/lib/types";
import Link from "next/link";

export default function PublicKnowledgebaseView({
  knowledgebase,
}: {
  knowledgebase: KnowledgebaseWithCollections;
}) {
  return (
    <div className="helpkit-bottom-container flex min-h-screen flex-col bg-[#eaeef6]">
      <div
        className="helpkit-top-container flex h-[280px] flex-shrink-0 justify-center px-4 sm:h-[350px] xl:px-0"
        style={{
          background:
            "radial-gradient(rgb(67, 30, 168) 1.28205%, rgb(28, 9, 45) 94.8718%)",
        }}
      >
        <div className="helpsite-wrapper mt-4 text-center sm:mt-8">
          <div className="mb-8 flex">
            <div className="flex h-[50px] items-center">
              <Link
                href="/"
                className="helpkit-company-logo flex h-10 max-w-[105px] pl-1 pr-3 text-left sm:max-w-[175px]"
              >
                {/* Add logo here */}
              </Link>
              <div className="helpkit-help-center-text font-display flex self-center pb-0.5 pl-4 pt-px align-middle text-sm font-medium text-white sm:text-base">
                Help Center
              </div>
            </div>
          </div>
          <div className="mb-5 mt-[18px] sm:mb-5 sm:mt-10">
            <span className="helpkit-search-prompt-text text-xl font-medium tracking-wide text-white sm:text-2xl">
              How can we help? 👋
            </span>
          </div>
          <div className="helpkit-search-wrapper relative z-50">
            <input
              type="text"
              id="searchInput"
              placeholder="Search for articles"
              className="helpkit-search-input helpsite-shadow hide-clear h-full w-full rounded border-none bg-[#ffffff38] px-4 py-3 pl-12 text-lg text-white placeholder-gray-50 placeholder-opacity-50 focus:ring-[#ffffff57] sm:py-4 sm:pl-14 sm:text-xl"
            />
            {/* Add search icon here */}
          </div>
        </div>
      </div>
      <div className="helpsite-wrapper mx-auto mt-[-85px] flex-grow px-3 sm:-mt-28 sm:px-0">
        <div className="mx-auto mt-3 w-full max-w-screen-xl">
          <div className="-mx-2 flex flex-wrap sm:-mx-3">
            {knowledgebase.collections.map((collection) => (
              <Link
                href={`/${knowledgebase.subdomain}/${collection.id}`}
                key={collection.id}
                className="helpkit-category-card mb-6 w-full transform px-3 transition hover:scale-[1.02] lg:w-1/2"
              >
                <div className="helpsite-shadow relative h-[215px] rounded bg-white text-center dark:bg-[#18233B]">
                  <div className="flex h-full w-full flex-grow flex-col items-center justify-center px-8">
                    <div className="mb-1 block">
                      <div className="mb-2">
                        <span className="helpkit-category-icon-emoji text-4xl">
                          {collection.page_icon}
                        </span>
                      </div>
                      <h2 className="text-primary-800 line-clamp-2 text-2xl font-bold dark:text-white">
                        {collection.name}
                      </h2>
                    </div>
                    <p className="mb-2 line-clamp-2 leading-snug text-gray-700 dark:text-gray-50">
                      {collection.description}
                    </p>
                    <p className="helpkit-category-article-count mt-2 text-xs font-medium text-gray-600 text-gray-600 dark:text-gray-200">
                      {collection.articleCount} Articles
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="helpkit-footer-wrapper helpsite-wrapper mb-5 mt-3 flex flex-col items-center justify-center self-center px-4 sm:mb-6 sm:mt-12 xl:px-0">
        <a
          target="_blank"
          rel="noopener"
          href="https://www.helpkit.so?utm_campaign=poweredBy&utm_medium=helpsite&utm_source=nakama"
          title="Powered By HelpKit"
          className="group mx-auto mt-3 flex cursor-pointer items-center justify-center rounded px-2 py-1 text-[12px] font-medium text-[#1A243A] opacity-60 hover:opacity-100 dark:text-[#f7fafc]"
        >
          <img
            width="16"
            src="/_nuxt/img/helpkit_logo_symbol.840bf11.png"
            alt="Powered By HelpKit"
            title="Powered By HelpKit"
            className="mr-1"
          />
          Powered by
          <span className="ml-[0.2rem] mr-1 font-semibold">HelpKit</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}
