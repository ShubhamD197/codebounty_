"use server";

import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Playlists are per-user and private. Every action below re-checks ownership
 * against the session rather than trusting the id it was handed, so a guessed
 * playlist id gets a "not found", not someone else's list.
 */

const PROBLEM_FIELDS = {
  id: true,
  number: true,
  title: true,
  difficulty: true,
  tags: true,
  primaryPattern: { select: { id: true, name: true, slug: true, color: true } },
};

/** Sidebar data: every playlist of the signed-in user, with its problem count. */
export const getUserPlaylists = async () => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized", data: [] };

  const playlists = await db.playlist.findMany({
    where: { userId: dbUser.id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { problems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: playlists };
};

/**
 * One playlist with its problems, each flagged with whether the current user
 * has solved it. Returns null data when the playlist is missing or not theirs.
 */
export const getPlaylistById = async (playlistId) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized", data: null };

  const playlist = await db.playlist.findFirst({
    where: { id: playlistId, userId: dbUser.id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true } },
      problems: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          problem: {
            select: {
              ...PROBLEM_FIELDS,
              solvedBy: { where: { userId: dbUser.id }, select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!playlist) return { success: false, error: "Playlist not found", data: null };

  return { success: true, data: playlist };
};

export const createPlaylist = async ({ name, description }) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized" };

  const trimmed = (name ?? "").trim();
  if (!trimmed) return { success: false, error: "Name is required" };

  try {
    const playlist = await db.playlist.create({
      data: { name: trimmed, description: description?.trim() || null, userId: dbUser.id },
      select: { id: true, name: true },
    });
    revalidatePath("/playlists");
    revalidatePath("/profile");
    return { success: true, data: playlist };
  } catch (error) {
    // Playlist name is unique per user, so a duplicate is a user error, not a
    // server fault worth a 500-shaped message.
    if (error.code === "P2002") {
      return { success: false, error: "You already have a playlist with that name" };
    }
    console.error("❌ Error creating playlist:", error);
    return { success: false, error: "Failed to create playlist" };
  }
};

export const deletePlaylist = async (playlistId) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized" };

  // deleteMany scoped by userId: a single delete on the id alone would let one
  // user delete another's playlist.
  const { count } = await db.playlist.deleteMany({
    where: { id: playlistId, userId: dbUser.id },
  });

  if (count === 0) return { success: false, error: "Playlist not found" };

  revalidatePath("/playlists");
  revalidatePath("/profile");
  return { success: true };
};

export const addProblemToPlaylist = async (problemId, playlistId) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized" };

  const playlist = await db.playlist.findFirst({
    where: { id: playlistId, userId: dbUser.id },
    select: { id: true, name: true },
  });
  if (!playlist) return { success: false, error: "Playlist not found" };

  try {
    await db.problemInPlaylist.create({ data: { problemId, playlistId } });
  } catch (error) {
    // Adding twice is harmless from the user's point of view; report it as
    // already-there instead of failing.
    if (error.code === "P2002") {
      return { success: true, alreadyPresent: true, playlistName: playlist.name };
    }
    console.error("❌ Error adding problem to playlist:", error);
    return { success: false, error: "Failed to add problem to playlist" };
  }

  revalidatePath(`/playlists/${playlistId}`);
  return { success: true, playlistName: playlist.name };
};

export const removeProblemFromPlaylist = async (problemId, playlistId) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized" };

  const playlist = await db.playlist.findFirst({
    where: { id: playlistId, userId: dbUser.id },
    select: { id: true },
  });
  if (!playlist) return { success: false, error: "Playlist not found" };

  await db.problemInPlaylist.deleteMany({ where: { problemId, playlistId } });

  revalidatePath(`/playlists/${playlistId}`);
  return { success: true };
};

const FAVORITES_NAME = "Favorites";

/**
 * The default list. Created on first use rather than at sign-up, so users who
 * never star anything do not carry an empty list around, and no backfill
 * migration is needed for existing accounts.
 */
const ensureFavorites = async (userId) => {
  const existing = await db.playlist.findFirst({
    where: { userId, name: FAVORITES_NAME },
    select: { id: true, name: true },
  });
  if (existing) return existing;

  return db.playlist.create({
    data: {
      userId,
      name: FAVORITES_NAME,
      description: "Problems you saved without picking a list.",
    },
    select: { id: true, name: true },
  });
};

/**
 * Ids of every problem the user has saved to any playlist, for filling the
 * bookmark in a catalogue. One query per page, rather than one per row.
 *
 * Membership in any list counts, not just Favorites: the control means "this is
 * saved somewhere", and a filled bookmark that ignored the user's own lists
 * would be lying.
 */
export const getSavedProblemIds = async () => {
  const dbUser = await getDbUser();
  if (!dbUser) return [];

  const rows = await db.problemInPlaylist.findMany({
    where: { playlist: { userId: dbUser.id } },
    select: { problemId: true },
    distinct: ["problemId"],
  });

  return rows.map((row) => row.problemId);
};

/** Every playlist of the user, each flagged with whether it holds this problem. */
export const getPlaylistsForProblem = async (problemId) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Unauthorized", data: [] };

  const playlists = await db.playlist.findMany({
    where: { userId: dbUser.id },
    select: {
      id: true,
      name: true,
      _count: { select: { problems: true } },
      problems: { where: { problemId }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = playlists
    .map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      count: playlist._count.problems,
      contains: playlist.problems.length > 0,
    }))
    // Favorites first: it is the default target for the star.
    .sort((a, b) => Number(b.name === FAVORITES_NAME) - Number(a.name === FAVORITES_NAME));

  return { success: true, data };
};

/**
 * Adds or removes in one call, so the star popover's rows are plain toggles.
 * Passing no playlistId targets Favorites, creating it if this is the user's
 * first star.
 */
export const toggleProblemInPlaylist = async (problemId, playlistId) => {
  const dbUser = await getDbUser();
  if (!dbUser) return { success: false, error: "Sign in to save problems" };

  const playlist = playlistId
    ? await db.playlist.findFirst({
        where: { id: playlistId, userId: dbUser.id },
        select: { id: true, name: true },
      })
    : await ensureFavorites(dbUser.id);

  if (!playlist) return { success: false, error: "Playlist not found" };

  const existing = await db.problemInPlaylist.findFirst({
    where: { problemId, playlistId: playlist.id },
    select: { id: true },
  });

  if (existing) {
    await db.problemInPlaylist.delete({ where: { id: existing.id } });
  } else {
    await db.problemInPlaylist.create({ data: { problemId, playlistId: playlist.id } });
  }

  revalidatePath("/playlists");
  revalidatePath(`/playlists/${playlist.id}`);

  return { success: true, added: !existing, playlistName: playlist.name };
};
