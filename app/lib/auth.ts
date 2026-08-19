import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
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
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.companyName = token.companyName;
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
