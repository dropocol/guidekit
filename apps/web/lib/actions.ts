"use server";

import prisma from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";
import { getSession, unstable_update } from "@/auth";
import {
  addDomainToVercel,
  removeDomainFromVercelProject,
  validDomainRegex,
} from "@/lib/domains";
import { put, del } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { getBlurDataURL } from "@/lib/utils";
import { getNotionData } from "@/lib/notion";
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils"; // Add this import
import { hash } from "bcryptjs"; // Import bcryptjs for hashing passwords

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export async function editUser(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
    });

    // Trigger the JWT update
    await unstable_update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });

    revalidatePath("/settings");
    return updatedUser;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "This email is already in use" };
    } else {
      return { error: error.message };
    }
  }
}

async function deleteOldImage(url: string | null) {
  if (url) {
    try {
      await del(url);
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  }
}

export async function updateSite(
  formData: FormData,
  siteId: string,
  key: string,
) {
  const session = await getSession();
  if (!session) {
    return { error: "Not authenticated" };
  }
  const site = await prisma.knowledgebase.findUnique({ where: { id: siteId } });
  if (!site || !session.user || site.userId !== session.user.id) {
    return { error: "Not authorized" };
  }
  const value = formData.get(key) as string;

  try {
    let response;
    if (key === "customDomain") {
      if (value.includes("vercel.pub")) {
        return {
          error: "Cannot use vercel.pub subdomain as your custom domain",
        };
      } else if (validDomainRegex.test(value)) {
        response = await prisma.knowledgebase.update({
          where: { id: site.id },
          data: { customDomain: value },
        });
        await Promise.all([addDomainToVercel(value)]);
      } else if (value === "") {
        response = await prisma.knowledgebase.update({
          where: { id: site.id },
          data: { customDomain: null },
        });
      }
      if (site.customDomain && site.customDomain !== value) {
        response = await removeDomainFromVercelProject(site.customDomain);
      }
    } else if (key === "image" || key === "logo") {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return {
          error:
            "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – please fill out this form for access: https://tally.so/r/nPDMNd",
        };
      }
      const file = formData.get(key) as File;
      const filename = `${nanoid()}.${file.type.split("/")[1]}`;
      const { url } = await put(filename, file, { access: "public" });
      const blurhash = key === "image" ? await getBlurDataURL(url) : null;
      response = await prisma.knowledgebase.update({
        where: { id: site.id },
        data: { [key]: url, ...(blurhash && { imageBlurhash: blurhash }) },
      });
    } else {
      response = await prisma.knowledgebase.update({
        where: { id: site.id },
        data: { [key]: value },
      });
    }
    await revalidateTag(
      `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    site.customDomain && (await revalidateTag(`${site.customDomain}-metadata`));
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `This ${key} is already taken` };
    } else {
      return { error: error.message };
    }
  }
}

export async function createKnowledgebase(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const userId = session.user.id;
  const name = formData.get("name") as string;
  const subdomain = formData.get("subdomain") as string;
  const notionLink = formData.get("notionLink") as string;
  const slug = formData.get("slug") as string;

  // Check if the subdomain already exists in the knowledgebase
  const existingKnowledgebase = await prisma.knowledgebase.findUnique({
    where: { subdomain: subdomain },
  });

  if (existingKnowledgebase) {
    return { error: "Subdomain is already taken" };
  }

  try {
    const pageId = notionLink.split("-").pop();
    const knowledgebaseData = await getNotionData(notionLink!);

    if (knowledgebaseData && !(knowledgebaseData instanceof Error)) {
      knowledgebaseData.userId = session.user.id;

      const knowledgebase = await prisma.knowledgebase.create({
        data: {
          name: name,
          notionLink: notionLink,
          userId: userId,
          slug: slug,
          subdomain: subdomain,
          articleCount: knowledgebaseData.articleCount,
        },
      });

      const collections = knowledgebaseData.collections;

      for (const collection of collections) {
        const { id, ...rest } = collection;
        console.log("rest", collection.id);
        await prisma.collection.create({
          data: {
            ...rest,
            // name: collection.name,
            slug: slugify(collection.name),
            // pageIcon: collection.pageIcon,
            userId: userId,
            // description: collection.description,
            knowledgebaseId: knowledgebase.id,
            // type: collection.type,
            // articleCount: collection.articleCount,
            // properties: collection.properties,
            subCollections: {
              create:
                collection.subCollections?.map((subCollection) => {
                  // console.log("Processing subCollection ID:", subCollection.id);
                  const { id, ...rest } = subCollection;
                  return {
                    ...rest,
                    slug: slugify(subCollection.name), // Generate slug for subCollection
                    userId: userId,
                    articles: {
                      create:
                        subCollection.articles?.map((article) => {
                          const { id, ...rest } = article;
                          return {
                            ...rest,
                            notionId: id,
                            slug: slugify(article.title), // Generate slug for article
                            properties: article.properties,
                            recordMap: article.recordMap,
                            userId: userId,
                            knowledgebaseId: knowledgebase.id,
                          };
                        }) || [],
                    },
                  };
                }) || [],
            },
          },
        });
      }

      return { success: true };
    } else {
      return { error: "Failed to fetch knowledgebase data" };
    }
  } catch (error: any) {
    console.log(error);
    return { error: error.message };
  }
}

export async function updateKnowledgebase(formData: FormData) {
  const session = await getSession();
  if (!session?.user!.id) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  console.log("Updating knowledgebase:", id);
  if (!id) {
    return { error: "Knowledgebase ID is required" };
  }

  const updateData: Record<string, any> = {};

  // List of fields that can be updated
  const updatableFields = [
    "name",
    "description",
    "subdomain",
    "font",
    "message404",
  ];

  // Only add fields to updateData if they are present in the formData
  for (const field of updatableFields) {
    const value = formData.get(field);
    if (value !== null) {
      updateData[field] = value;
    }
  }

  console.log(updateData);

  // Handle custom domain
  const customDomain = formData.get("customDomain") as string;
  if (customDomain !== undefined && customDomain !== null) {
    // TODO :  remove this check
    if (customDomain.includes("vercel.pub")) {
      return {
        error: "Cannot use vercel.pub subdomain as your custom domain",
      };
    } else if (validDomainRegex.test(customDomain)) {
      updateData.customDomain = customDomain;
      const res = await addDomainToVercel(customDomain);
      console.log("res", res);
    } else if (customDomain === "") {
      updateData.customDomain = null;
    }

    const existingKnowledgebase = await prisma.knowledgebase.findUnique({
      where: { id },
      select: { customDomain: true },
    });

    if (
      existingKnowledgebase?.customDomain &&
      existingKnowledgebase.customDomain !== customDomain
    ) {
      await removeDomainFromVercelProject(existingKnowledgebase.customDomain);
    }
  }

  // Handle file uploads separately
  const image = formData.get("image") as File | null;
  const logo = formData.get("logo") as File | null;
  const favicon = formData.get("favicon") as File | null;

  const knowledgebase = await prisma.knowledgebase.findUnique({
    where: { id },
    select: { image: true, logo: true },
  });

  if (image) {
    try {
      const newImageUrl = await uploadImage(image);
      if (knowledgebase?.image) {
        await deleteOldImage(knowledgebase.image);
      }
      updateData.image = newImageUrl;
      updateData.imageBlurhash = await getBlurDataURL(newImageUrl);
    } catch (error) {
      return { error: "Failed to upload image" };
    }
  }

  if (logo) {
    try {
      const newLogoUrl = await uploadImage(logo);
      // await deleteOldImage(knowledgebase?.logo);
      if (knowledgebase?.logo) {
        await deleteOldImage(knowledgebase.logo);
      }
      updateData.logo = newLogoUrl;
    } catch (error) {
      return { error: "Failed to upload logo" };
    }
  }

  if (favicon) {
    const faviconFile = formData.get("favicon") as File;
    const faviconUrl = await uploadImage(faviconFile);
    updateData.favicon = faviconUrl;
  }

  try {
    const response = await prisma.knowledgebase.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/knowledgebase/${id}/settings`);
    return response;
  } catch (error: any) {
    console.error("Error updating knowledgebase:", error);
    return {
      error: error.message || "Error updating knowledgebase",
    };
  }
}

// Implement this function to handle image uploads
async function uploadImage(file: File): Promise<string> {
  console.log("Uploading image:", file.name);
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN. Please set it in your environment variables.",
    );
  }

  const filename = `${nanoid()}.${file.type.split("/")[1]}`;

  try {
    const { url } = await put(filename, file, {
      access: "public",
    });

    console.log("Uploaded image to Vercel Blob:", url);
    return url;
  } catch (error) {
    console.error("Error uploading image to Vercel Blob:", error);
    throw new Error("Failed to upload image");
  }
}

// Add this function to the existing actions file
export async function updateArticle(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return {
      error: "Not authenticated",
    };
  }
  const articleId = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const image = formData.get("image") as File | null;

  try {
    const updateData: Prisma.ArticleUpdateInput = {
      slug: slug,
    };

    if (image) {
      try {
        const imageUrl = await uploadImage(image);
        updateData.image = imageUrl;
      } catch (error) {
        return { error: "Failed to upload image" };
      }
    }

    const article = await prisma.article.update({
      where: {
        id: articleId,
      },
      data: updateData,
    });

    revalidateTag(`article-${articleId}`);
    return article;
  } catch (error) {
    console.error("Error updating article:", error);
    return {
      error: "Error updating article",
    };
  }
}

export async function deleteArticle(formData: FormData) {
  // Implementation of deleteArticle
}

export async function removeKnowledgebaseImage(
  id: string,
  type: "thumbnail" | "logo" | "favicon",
) {
  try {
    const knowledgebase = await prisma.knowledgebase.findUnique({
      where: { id },
    });

    if (!knowledgebase) {
      return { error: "Knowledgebase not found" };
    }

    let fieldToUpdate: "image" | "logo" | "favicon";
    switch (type) {
      case "thumbnail":
        fieldToUpdate = "image";
        break;
      case "logo":
        fieldToUpdate = "logo";
        break;
      case "favicon":
        fieldToUpdate = "favicon";
        break;
    }

    const currentImageUrl = knowledgebase[fieldToUpdate];

    if (currentImageUrl) {
      await deleteOldImage(currentImageUrl);
    }

    await prisma.knowledgebase.update({
      where: { id },
      data: { [fieldToUpdate]: null },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing image:", error);
    return { error: "Failed to remove image" };
  }
}

export async function updatePassword(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  try {
    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// export async function deleteKnowledgebase(id: string) {
//   try {
//     console.log("Deleting knowledgebase:", id);
//     const response = await fetch(`/api/knowledgebase/${id}`, {
//       method: "DELETE",
//     });

//     console.log("Response:", response);

//     if (!response.ok) {
//       const error = await response.text();
//       return { error };
//     }

//     return { success: true };
//   } catch (error) {
//     return { error: "An error occurred while deleting the knowledgebase" };
//   }
// }
