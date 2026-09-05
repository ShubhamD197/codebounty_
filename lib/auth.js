import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

/**
 * Resolves the Clerk session to our local User row.
 *
 * Wrapped in React `cache()` so the several actions that run during a single
 * request share one query instead of each hitting Clerk + Postgres again.
 * Returns null when signed out — callers must handle that.
 */
export const getDbUser = cache(async () => {
  const user = await currentUser();
  if (!user) return null;

  return db.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, role: true },
  });
});
