import React from "react";
import Form from "@/ui/form";
import { updateArticle } from "@/lib/actions";
import DeleteArticleForm from "@/ui/form/delete-article-form";

export default function ArticleSettingsSidebar({ article }: any) {
  return (
    <div className="w-56 border-l border-stone-200 p-4 dark:border-stone-700">
      <h2 className="font-cal text-xl font-bold dark:text-white">
        Article Settings
      </h2>
      <div className="mt-4 space-y-6">
        <Form
          title="Slug"
          description="The slug is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens."
          helpText="Please use a slug that is unique to this article."
          inputAttrs={{
            name: "slug",
            type: "text",
            defaultValue: article.slug,
            placeholder: "article-slug",
          }}
          handleSubmit={updateArticle}
        />

        <Form
          title="Thumbnail image"
          description="The thumbnail image for your article. Accepted formats: .png, .jpg, .jpeg"
          helpText="Max file size 50MB. Recommended size 1200x630."
          inputAttrs={{
            name: "image",
            type: "file",
            defaultValue: article.image,
          }}
          handleSubmit={updateArticle}
        />

        <DeleteArticleForm articleName={article.title} />
      </div>
    </div>
  );
}
