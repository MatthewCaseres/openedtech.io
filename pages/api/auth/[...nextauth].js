import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

const callbacks = {
  session: async (session, user) => {
    const id = user.id;
    return Promise.resolve({ ...session, id });
  },
};

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: "user:email",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    // ...add more providers here
  ],
  adapter: PrismaAdapter(prisma),
  callbacks,

  // A database is optional, but required to persist accounts in a database
  database: process.env.DATABASE_URL,
});
