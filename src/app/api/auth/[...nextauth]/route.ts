import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { cookies } from "next/headers";
import { setCookie as setClientCookie, triggerAuthChangeEvent } from "@/lib/auth-utils";

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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: "user", // Default role
          },
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }
      
      // Set a cookie to indicate the user is authenticated
      // This is used by the client-side auth provider
      cookies().set("auth-token", "authenticated", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
