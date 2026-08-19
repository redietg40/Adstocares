import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("=== LOGIN ATTEMPT ===");
        console.log("Email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
          console.log("User not found");
          return null;
        }

        console.log("Comparing password...");
        const isValid = await compare(credentials.password, user.passwordHash);
        console.log("Password valid:", isValid);

        if (!isValid) {
          console.log("Invalid password");
          return null;
        }

        console.log("✅ Login successful for:", user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.companyName || user.email.split('@')[0],
          role: user.role,
          isVerified: user.isVerified,
          companyName: user.companyName,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || user.companyName || user.email?.split('@')[0];
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
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
    signIn: "/company/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };