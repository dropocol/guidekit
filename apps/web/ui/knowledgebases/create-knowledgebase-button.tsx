"use client";

import { useModal } from "@/ui/modal/provider";
import { ReactNode } from "react";
import CreateKnowledgebaseModal from "@/ui/modal/create-knowledgebase";

export default function CreateKnowledgebaseButton() {
  const modal = useModal();

  return (
    <button
      onClick={() => modal?.show(<CreateKnowledgebaseModal />)}
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      Create Knowledgebase
    </button>
  );
}
