import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { cookies } from "next/headers";

// This is a workaround to make NextAuth work with Edge runtime
export const runtime = "edge";

// Configure NextAuth
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "placeholder-client-secret",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
