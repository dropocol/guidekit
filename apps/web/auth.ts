import NextAuth from "next-auth";
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});

export async function getSession() {
  const session = await auth();
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
