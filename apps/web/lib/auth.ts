import type { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import EmailProvider from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { decode, encode } from "next-auth/jwt";
import { User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;
const adapter = PrismaAdapter(prisma);

export const authOptions: NextAuthConfig = {
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
      async authorize(credentials, req) {
        // Validate user credentials
        const user = await prisma.user.findFirst({
          where: { email: credentials!.email! },
        });

        if (
          user &&
          (await compare(credentials!.password as string, user.password!))
        ) {
          // If the user is found and the password matches, return the user object
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
          };
        } else {
          // If the credentials are invalid, return null
          return null;
        }
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
  // jwt: {
  //   maxAge: 60 * 60 * 24 * 30,
  //   async encode(arg) {
  //     return (arg.token?.sessionId as string) ?? encode(arg);
  //   },
  // },
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use "database" for database sessions
    //maxAge: 30 * 24 * 60 * 60, // Session max age in seconds (30 days)
    //updateAge: 24 * 60 * 60, // How often the session is updated in seconds (24 hours)
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
    // authorized: async ({ auth }) => {
    //   // Logged in users are authenticated, otherwise redirect to login page
    //   // console.log("authorized callback", auth);
    //   // return !!auth;
    //   return true;
    // },
    // jwt: async ({
    //   token,
    //   user,
    //   trigger,
    // }: {
    //   token: JWT;
    //   user: User | AdapterUser | any;
    //   trigger?: "signIn" | "update" | "signUp";
    //   // trigger: any;
    // }) => {
    jwt: async ({ token, user, trigger }) => {
      // console.log("JWT CALLBACK : ", token);
      if (user) {
        token.user = user;
      }

      console.log("JWT TRIGGET : ", trigger);

      // refresh the user's data if they update their name / email
      if (trigger === "update") {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        if (refreshedUser) {
          token.user = refreshedUser;
        } else {
          return {};
        }
      }

      return token;
      // if (account?.provider === "credentials") {
      //   const expires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
      //   const sessionToken = await encode({
      //     token: { userId: user.id },
      //     secret: process.env.NEXTAUTH_SECRET!,
      //   });
      //   const session = await adapter.createSession!({
      //     userId: user.id!,
      //     sessionToken,
      //     expires,
      //   });

      //   token.user = user;
      //   token.sessionId = session.sessionToken;
      // }
      // console.log("jwt callback", token);
      // return token;
    },
    session: async ({ session, token }) => {
      // console.log("SESSION CALLBACK : ", session, token);
      // console.log("SESSION TRIGGET : ", trigger);
      // session.user = {
      //   ...session.user,
      //   // @ts-expect-error
      //   id: token.sub,
      //   // @ts-expect-error
      //   username: token?.user?.username || token?.user?.gh_username,
      // };
      // return session;

      session.user = {
        id: token.sub,
        // @ts-ignore
        ...(token || session).user,
      };
      return session;
    },
    async signIn({ user }) {
      // console.log("signIn callback", user);
      return true;
    },
  },
};
