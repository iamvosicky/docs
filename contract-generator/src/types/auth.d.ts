import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
    };
  }
}
