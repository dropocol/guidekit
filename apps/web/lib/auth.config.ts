import type { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prismaEdge from "@/lib/edge";
// import prisma from "@/lib/prisma";
// import edge from "@/lib/edge";
// import EmailProvider from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
// import { decode, encode } from "next-auth/jwt";
import { User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { getUserByEmail, getAllUsers, getUserById } from "@/data/user";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;
// const adapter = PrismaAdapter(prisma);

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // throw new Error("Missing credentials");
          console.log("Missing credentials");
          return null;
        }

        const user = await getUserByEmail(credentials.email as string);

        // const users = await getAllUsers();

        // const user = {
        //   id: "clz1m73sr000018ujyrb1pv2c",
        //   email: "zee.khan34@gmail.com",
        //   name: "Zee Khan",
        //   password:
        //     "$2b$10$sGIztfPJ3wvTolPIik9GyOkWaHORla.Xt43emBxs7R1mmWmtzmefy",
        // };

        if (!user) {
          // throw new Error("User not found");
          console.log("User not found");
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password!,
        );
        if (!isPasswordValid) {
          // throw new Error("Invalid password");
          console.log("Invalid password");
          return null;
        }

        return user;
      },
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          gh_username: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  pages: {
    // signIn: `/login`,
    // verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: VERCEL_DEPLOYMENT
          ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },

  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // console.log("SIGN IN CALLBACK : ", user, account, profile);
      return true;
    },
    jwt: async ({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user: User | AdapterUser;
      trigger?: "signIn" | "update" | "signUp";
    }) => {
      // console.log("JWT CALLBACK : ", token);
      if (user) {
        token.user = user;
      }
      console.log("JWT TRIGGET : ", trigger);
      // refresh the user's data if they update their name / email
      if (trigger === "update") {
        const refreshedUser = await getUserById(token.sub as string);
        if (refreshedUser) {
          const updateToken = {
            ...token,
            ...refreshedUser,
            user: refreshedUser,
          };

          token = updateToken;
          console.log("REFRESHED USER : ", token);
        } else {
          return {};
        }
      }
      return token;
    },
    session: async ({ session, token, trigger }) => {
      session.user = {
        id: token.sub,
        // @ts-ignore
        ...(token || session).user,
      };

      return session;
    },
  },
};
