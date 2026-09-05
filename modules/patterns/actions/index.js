"use server";

import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import { tallyByPattern } from "@/modules/patterns/progress";

const PATTERN_CARD_FIELDS = {
  id: true,
  name: true,
  slug: true,
  description: true,
  color: true,
  icon: true,
  order: true,
};

/**
 * Tallies how many problems the current user has solved, keyed by
 * primaryPatternId. Returns {} when signed out.
 *
 * ponytail: reads the user's whole solved set and counts in JS. Prisma's
 * groupBy cannot group across the Problem relation, and a raw query is not
 * worth it while a user's solved set is in the hundreds. Revisit with a raw
 * GROUP BY if that stops being true.
 */
const solvedCountsByPattern = async (userId) => {
  if (!userId) return {};

  const solved = await db.problemSolved.findMany({
    where: { userId },
    select: { problem: { select: { primaryPatternId: true } } },
  });

  return tallyByPattern(solved);
};

export const getAllPatterns = async () => {
  try {
    const dbUser = await getDbUser();

    const [patterns, solvedCounts] = await Promise.all([
      db.pattern.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          ...PATTERN_CARD_FIELDS,
          _count: { select: { problems: true } },
        },
      }),
      solvedCountsByPattern(dbUser?.id),
    ]);

    return {
      success: true,
      data: patterns.map((pattern) => ({
        ...pattern,
        problemCount: pattern._count.problems,
        solvedCount: solvedCounts[pattern.id] ?? 0,
      })),
    };
  } catch (error) {
    console.error("❌ Error fetching patterns:", error);
    return { success: false, error: "Failed to fetch patterns" };
  }
};

export const getPatternBySlug = async (slug) => {
  try {
    const dbUser = await getDbUser();

    const pattern = await db.pattern.findUnique({
      where: { slug },
      select: {
        ...PATTERN_CARD_FIELDS,
        problems: {
          // List-view fields only - never testCases or referenceSolutions.
          select: {
            id: true,
            title: true,
            difficulty: true,
            tags: true,
            solvedBy: dbUser
              ? { where: { userId: dbUser.id }, select: { id: true } }
              : false,
          },
          orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!pattern) {
      return { success: false, error: "Pattern not found" };
    }

    return { success: true, data: pattern };
  } catch (error) {
    console.error("❌ Error fetching pattern:", error);
    return { success: false, error: "Failed to fetch pattern" };
  }
};

/** Patterns for the admin problem form's picker. */
export const getPatternOptions = async () => {
  try {
    const patterns = await db.pattern.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, color: true },
    });
    return { success: true, data: patterns };
  } catch (error) {
    console.error("❌ Error fetching pattern options:", error);
    return { success: false, error: "Failed to fetch patterns" };
  }
};
