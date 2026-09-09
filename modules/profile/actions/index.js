"use server";

import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";

const PROBLEM_SUMMARY = {
  id: true,
  number: true,
  title: true,
  difficulty: true,
  primaryPatternId: true,
};

/**
 * Everything the profile page renders, in one round trip.
 *
 * The catalogue totals and the pattern list are fetched alongside the user
 * because the page shows progress as "solved out of total", which is
 * meaningless without the denominator.
 */
export const getProfileData = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        submissions: {
          include: { problem: { select: PROBLEM_SUMMARY } },
          orderBy: { createdAt: "desc" },
        },
        solvedProblems: {
          include: { problem: { select: PROBLEM_SUMMARY } },
          orderBy: { createdAt: "desc" },
        },
        playlists: {
          include: { _count: { select: { problems: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!dbUser) return null;

    const [difficultyTotals, patterns] = await Promise.all([
      db.problem.groupBy({ by: ["difficulty"], _count: { _all: true } }),
      db.pattern.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          order: true,
          _count: { select: { problems: true } },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    ]);

    return {
      user: dbUser,
      totals: {
        EASY: difficultyTotals.find((row) => row.difficulty === "EASY")?._count._all ?? 0,
        MEDIUM: difficultyTotals.find((row) => row.difficulty === "MEDIUM")?._count._all ?? 0,
        HARD: difficultyTotals.find((row) => row.difficulty === "HARD")?._count._all ?? 0,
      },
      patterns,
    };
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return null;
  }
};

/**
 * Kept because the dashboard still imports it. The profile now uses
 * getProfileData instead.
 */
export const getCurrentUserData = async () => {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return null;

    return db.user.findUnique({
      where: { id: dbUser.id },
      include: {
        submissions: {
          include: { problem: { select: PROBLEM_SUMMARY } },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        solvedProblems: {
          include: { problem: { select: PROBLEM_SUMMARY } },
          orderBy: { createdAt: "desc" },
        },
        playlists: {
          include: { _count: { select: { problems: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return null;
  }
};
