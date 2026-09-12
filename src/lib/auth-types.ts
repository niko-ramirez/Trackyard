import type { DefaultSession } from "next-auth";

// next-auth's own "next-auth"/"next-auth/jwt" entrypoints only re-export
// these types (`export type { Session } from "@auth/core/types"`), so
// augmenting "next-auth" directly doesn't merge — the interfaces have to be
// augmented where they're actually declared, in @auth/core.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
  }
}
