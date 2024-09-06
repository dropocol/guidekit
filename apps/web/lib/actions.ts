"use server";

import prisma from "@/lib/prisma";
import { Post, Site } from "@prisma/client";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  getSession,
  withPostAuth,
  withSiteAuth,
  unstable_update,
} from "@/auth";
import {
  addDomainToVercel,
  removeDomainFromVercelProject,
  validDomainRegex,
} from "@/lib/domains";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { getBlurDataURL } from "@/lib/utils";
import { getNotionData } from "@/lib/notion";
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils"; // Add this import

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export async function createSite(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const response = await prisma.site.create({
      data: {
        name,
        description,
        subdomain,
        user: { connect: { id: session.user.id } },
      },
    });
    await revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "This subdomain is already taken" };
    } else {
      return { error: error.message };
    }
  }
}

export async function editUser(formData: FormData, _id: unknown, key: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const value = formData.get(key) as string;

  try {
    const response = await prisma.user.update({
      where: { id: session.user.id },
      data: { [key]: value },
    });
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `This ${key} is already in use` };
    } else {
      return { error: error.message };
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
  const site = await prisma.site.findUnique({ where: { id: siteId } });
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
        response = await prisma.site.update({
          where: { id: site.id },
          data: { customDomain: value },
        });
        await Promise.all([addDomainToVercel(value)]);
      } else if (value === "") {
        response = await prisma.site.update({
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
      response = await prisma.site.update({
        where: { id: site.id },
        data: { [key]: url, ...(blurhash && { imageBlurhash: blurhash }) },
      });
    } else {
      response = await prisma.site.update({
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

// export async function deleteSite(siteId: string) {
//   const session = await getSession();
//   if (!session) {
//     return { error: "Not authenticated" };
//   }
//   const site = await prisma.site.findUnique({ where: { id: siteId } });
//   if (!site || !session.user || site.userId !== session.user.id) {
//     return { error: "Not authorized" };
//   }
//   try {
//     const response = await prisma.site.delete({ where: { id: site.id } });
//     await revalidateTag(
//       `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
//     );
//     site.customDomain && (await revalidateTag(`${site.customDomain}-metadata`));
//     return response;
//   } catch (error: any) {
//     return { error: error.message };
//   }
// }

export const deletePost = withSiteAuth(async function deletePost(
  _: FormData,
  post: Post,
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const foundPost = await prisma.post.findUnique({
    where: { id: post.id },
    include: { site: true },
  });
  if (!foundPost || foundPost.userId !== session.user.id) {
    return { error: "Not authorized" };
  }
  try {
    const response = await prisma.post.delete({ where: { id: post.id } });
    return response;
  } catch (error: any) {
    return { error: error.message };
  }
});

export const createPost = withSiteAuth(async function createPost(
  _: FormData,
  site: Site,
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      error: "Not authenticated",
    };
  }
  const response = await prisma.post.create({
    data: {
      siteId: site.id,
      userId: session.user.id,
    },
  });

  await revalidateTag(
    `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
  );
  site.customDomain && (await revalidateTag(`${site.customDomain}-posts`));

  return response;
});
// export async function createPost(siteId: string) {
//   const session = await getSession();
//   if (!session?.user?.id) {
//     return { error: "Not authenticated" };
//   }
//   const site = await prisma.site.findUnique({ where: { id: siteId } });
//   if (!site || site.userId !== session.user.id) {
//     return { error: "Not authorized" };
//   }
//   const response = await prisma.post.create({
//     data: { siteId: site.id, userId: session.user.id },
//   });
//   await revalidateTag(
//     `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
//   );
//   site.customDomain && (await revalidateTag(`${site.customDomain}-posts`));
//   return response;
// }

export async function updatePost(data: Post) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const post = await prisma.post.findUnique({
    where: { id: data.id },
    include: { site: true },
  });
  if (!post || post.userId !== session.user.id) {
    return { error: "Post not found" };
  }
  try {
    const response = await prisma.post.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
      },
    });
    await revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    await revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
    );
    post.site?.customDomain &&
      (await revalidateTag(`${post.site?.customDomain}-posts`),
      await revalidateTag(`${post.site?.customDomain}-${post.slug}`));
    return response;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePostMetadata(
  formData: FormData,
  postId: string,
  key: string,
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { site: true },
  });
  if (!post || post.userId !== session.user.id) {
    return { error: "Not authorized" };
  }
  const value = formData.get(key) as string;
  try {
    let response;
    if (key === "image") {
      const file = formData.get("image") as File;
      const filename = `${nanoid()}.${file.type.split("/")[1]}`;
      const { url } = await put(filename, file, { access: "public" });
      const blurhash = await getBlurDataURL(url);
      response = await prisma.post.update({
        where: { id: post.id },
        data: { image: url, imageBlurhash: blurhash },
      });
    } else {
      response = await prisma.post.update({
        where: { id: post.id },
        data: { [key]: key === "published" ? value === "true" : value },
      });
    }
    await revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    await revalidateTag(
      `${post.site?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
    );
    post.site?.customDomain &&
      (await revalidateTag(`${post.site?.customDomain}-posts`),
      await revalidateTag(`${post.site?.customDomain}-${post.slug}`));
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: `This slug is already in use` };
    } else {
      return { error: error.message };
    }
  }
}

// export const deletePost = withPostAuth(async (_: FormData, post: Post) => {
//   const session = await getSession();
//   if (!session?.user?.id) {
//     return { error: "Not authenticated" };
//   }
//   const foundPost = await prisma.post.findUnique({
//     where: { id: post.id },
//     include: { site: true },
//   });
//   if (!foundPost || foundPost.userId !== session.user.id) {
//     return { error: "Not authorized" };
//   }
//   try {
//     const response = await prisma.post.delete({ where: { id: post.id } });
//     return response;
//   } catch (error: any) {
//     return { error: error.message };
//   }
// });

// export const deletePost = withPostAuth(async (_: FormData, post: Post) => {
//   try {
//     const response = await prisma.post.delete({
//       where: {
//         id: post.id,
//       },
//       select: {
//         siteId: true,
//       },
//     });
//     return response;
//   } catch (error: any) {
//     return {
//       error: error.message,
//     };
//   }
// });

export async function getSiteFromPostId(postId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      siteId: true,
    },
  });
  return post?.siteId;
}

export const deleteSite = withSiteAuth(async function deleteSite(
  _: FormData,
  site: Site,
) {
  try {
    const response = await prisma.site.delete({
      where: {
        id: site.id,
      },
    });
    await revalidateTag(
      `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    response.customDomain &&
      (await revalidateTag(`${site.customDomain}-metadata`));
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

export async function createKnowledgebase(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const notionLink = formData.get("notionLink") as string;
  const slug = formData.get("slug") as string;

  try {
    const pageId = notionLink.split("-").pop();
    const knowledgebaseData = await getNotionData(notionLink!);

    if (knowledgebaseData && !(knowledgebaseData instanceof Error)) {
      knowledgebaseData.userId = session.user.id;

      const knowledgebase = await prisma.knowledgebase.create({
        data: {
          name: name,
          notionLink: notionLink,
          userId: session.user.id,
          slug: slug,
          subdomain: `${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
        },
      });

      const collections = knowledgebaseData.collections;

      for (const collection of collections) {
        const knowledgebaseExists = await prisma.knowledgebase.findUnique({
          where: { id: knowledgebase.id },
        });

        if (!knowledgebaseExists) {
          throw new Error(`Knowledgebase with ID ${collection.id} not found`);
        }

        await prisma.collection.create({
          data: {
            name: collection.name,
            slug: slugify(collection.name), // Generate slug from name
            pageIcon: collection.pageIcon,
            description: collection.description,
            knowledgebase: { connect: { id: knowledgebase.id } },
            type: collection.type,
            articleCount: collection.articleCount,
            properties: collection.properties,
            subCollections: {
              create:
                collection.subCollections?.map((subCollection) => ({
                  ...subCollection,
                  slug: slugify(subCollection.name), // Generate slug for subCollection
                  articles: {
                    create:
                      subCollection.articles?.map((article) => ({
                        ...article,
                        slug: slugify(article.title), // Generate slug for article
                        properties: article.properties,
                        recordMap: article.recordMap,
                      })) || [],
                  },
                })) || [],
            },
          },
        });
      }

      return true;
    } else {
      return { error: "Failed to fetch knowledgebase data" };
    }
  } catch (error: any) {
    console.log(error);
    return { error: error.message };
  }
}

export async function updateKnowledgebase(formData: FormData) {
  const knowledgebaseId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;
  const customDomain = formData.get("customDomain") as string;
  const image = formData.get("image") as File;
  const logo = formData.get("logo") as File;
  const font = formData.get("font") as string;
  const message404 = formData.get("message404") as string;

  try {
    const response = await prisma.knowledgebase.update({
      where: {
        id: knowledgebaseId,
      },
      data: {
        name,
        description,
        subdomain,
        customDomain,
        image: image instanceof File ? await uploadImage(image) : undefined,
        logo: logo instanceof File ? await uploadImage(logo) : undefined,
        font,
        message404,
      },
    });

    revalidatePath(`/knowledgebase/${knowledgebaseId}/settings`);
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

// Add this helper function to handle image uploads
async function uploadImage(file: File): Promise<string> {
  // Implement your image upload logic here
  // This is just a placeholder, you'll need to replace it with your actual upload code
  console.log("Uploading image:", file.name);
  return "https://example.com/uploaded-image-url.jpg";
}
