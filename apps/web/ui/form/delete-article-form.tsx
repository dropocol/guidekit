import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteArticle } from "@/lib/actions";

export default function DeleteArticleForm({
  articleName,
}: {
  articleName: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setDeleting(true);
        await deleteArticle(new FormData(e.target as HTMLFormElement));
        setDeleting(false);
        router.push("/knowledgebases");
      }}
    >
      <div className="flex flex-col space-y-2">
        <h2 className="text-sm font-medium text-red-600">Delete Article</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Deleting this article will permanently remove it and all of its
          contents from your knowledgebase.
        </p>
        <div>
          <input
            type="text"
            name="confirm"
            placeholder={`Type "${articleName}" to confirm`}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        </div>
        <button
          disabled={deleting}
          className={`${
            deleting
              ? "cursor-not-allowed bg-red-100 text-red-400"
              : "bg-red-600 text-white hover:bg-red-700"
          } flex h-8 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
        >
          {deleting ? "Deleting..." : "Delete Article"}
        </button>
      </div>
    </form>
  );
}
