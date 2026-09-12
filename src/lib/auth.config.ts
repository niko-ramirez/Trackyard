import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the auth config: no providers that touch Prisma/Node
// APIs here, so this can be imported from middleware (Edge runtime).
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
