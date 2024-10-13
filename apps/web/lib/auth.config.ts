import type { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { AuthError, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { getUserById, checkCredentials } from "@/data/user";
import { CredentialsSignin } from "next-auth";

declare module "next-auth" {
  interface User {
    isEmailVerified?: boolean;
  }
}
// class InvalidLoginError extends CredentialsSignin {
//   code = "Invalid Email or password";
// }

class CustomError extends AuthError {
  constructor(message: string) {
    super();
    this.message = message;
  }
  override stack = "";
}

// class CredentialsError extends CredentialsSignin {
//   constructor(message: string) {
//     super(message);
//     this.message = message;
//   }
//   override stack = "";
// }

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

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
          throw new CustomError("Email or password is missing");
        }
        let user = await checkCredentials(
          credentials.email as string,
          credentials.password as string,
        );

        if (!user) {
          throw new CustomError("Email or password is incorrect");
        }

        // console.log("USER : ", user);
        return user;
      },
    }),
  ],
  pages: {
    signIn: `/login`,
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
    jwt: async ({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user: User | AdapterUser;
      trigger?: "signIn" | "update" | "signUp";
    }) => {
      // console.log("JWT Callback - Token        :", token);
      // console.log("JWT Callback - User         :", user);
      // console.log("JWT Callback - Trigger      :", trigger);

      if (user) {
        token.user = user;
      }

      // refresh the user's data if they update their name / email
      if (trigger === "update") {
        const refreshedUser = await getUserById(token.sub as string);
        if (refreshedUser) {
          const updateToken = {
            ...token,
            // ...refreshedUser,
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
      // console.log("SESSION Callback - Session  :", session);
      // console.log("SESSION Callback - Token    :", token);
      // console.log("SESSION Callback - Trigger  :", trigger);

      session.user = {
        id: token.sub,
        // @ts-ignore
        ...(token || session).user,
      };

      return session;
    },
  },
};
