import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import type { NextAuthOptions } from "next-auth";

import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        if (credentials.loginType === "company" && user.role !== "company") {
          throw new Error("NOT_A_COMPANY");
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.companyName || user.email.split('@')[0],
          role: user.role,
          isVerified: user.isVerified,
          companyName: user.companyName,
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name || user.companyName || user.email?.split('@')[0];
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.id) {
        // Double-check the database to ensure this user still exists!
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id }
        });

        // If user was deleted from Prisma Studio, invalidate the session cookie
        if (!dbUser) {
          return { ...session, user: null };
        }

        if (session.user) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.companyName || dbUser.email?.split('@')[0];
          session.user.role = dbUser.role;
          session.user.isVerified = dbUser.isVerified;
          session.user.companyName = dbUser.companyName;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
