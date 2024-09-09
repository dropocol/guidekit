import NextAuth from "next-auth";
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const { auth, handlers, signIn, signOut, unstable_update } =
  NextAuth(authOptions);

export async function getSession() {
  // return auth() as Promise<{
  //   user: {
  //     id: string;
  //     name: string;
  //     username: string;
  //     email: string;
  //     image: string;
  //   };
  // } | null>;
  const session = await auth();
  // console.log("GET SESSION : ", { session });
  return {
    ...session,
    nameId: session?.user?.id,
  };
}

export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }
    const site = await prisma.knowledgebase.findUnique({
      where: {
        id: siteId,
      },
    });
    if (!site || !session.user || site.userId !== session.user.id) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, site, key);
  };
}

export async function withPostAuth(action: any) {
  return async (
    formData: FormData | null,
    postId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return {
        error: "Not authenticated",
      };
    }
    const post = await prisma.knowledgebase.findUnique({
      where: {
        id: postId,
      },
      // include: {
      //   site: true,
      // },
    });
    if (!post || post.userId !== session.user.id) {
      return {
        error: "Post not found",
      };
    }

    return action(formData, post, key);
  };
}
