"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createPlaylist,
  getPlaylistsForProblem,
  toggleProblemInPlaylist,
} from "@/modules/playlists/actions";

/**
 * Save control at the end of a problem row. A bookmark, not a star: the star is
 * LeetCode's mark and means "favourite", while this opens a picker over every
 * list, which is what a bookmark reads as.
 *
 * Filled when the problem is in any of the user's playlists. `saved` is the
 * initial value from the page's one membership query; it is kept in local state
 * afterwards so a toggle shows immediately rather than waiting for a refresh.
 */
export default function SaveToPlaylistButton({ problemId, saved = false, title }) {
  const [open, setOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);
  const [playlists, setPlaylists] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  const load = async () => {
    const result = await getPlaylistsForProblem(problemId);
    if (!result.success) {
      toast.error(result.error);
      setPlaylists([]);
      return [];
    }
    setPlaylists(result.data);
    return result.data;
  };

  const onOpenChange = (next) => {
    setOpen(next);
    if (next && playlists === null) load();
  };

  const toggle = async (playlist) => {
    setPendingId(playlist?.id ?? "favorites");
    const result = await toggleProblemInPlaylist(problemId, playlist?.id);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    // Any list counts towards the filled state, so re-derive it from the
    // refreshed rows rather than from the one that was just toggled.
    setIsSaved(true);
    toast.success(
      result.added
        ? `Added to "${result.playlistName}"`
        : `Removed from "${result.playlistName}"`
    );
    const refreshed = await load();
    setIsSaved(refreshed.some((playlist) => playlist.contains));
    router.refresh();
  };

  const create = async (event) => {
    event.preventDefault();
    setCreating(true);
    const created = await createPlaylist({ name: newName });

    if (!created.success) {
      setCreating(false);
      toast.error(created.error);
      return;
    }

    // Creating a list from here means "put this problem in it".
    await toggleProblemInPlaylist(problemId, created.data.id);
    setCreating(false);
    setNewName("");
    setIsSaved(true);
    toast.success(`Added to "${created.data.name}"`);
    await load();
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className="text-text-muted hover:text-pending transition-colors p-1 -m-1"
        aria-label={`Save ${title} to a playlist`}
      >
        <Bookmark
          className={`size-4 ${isSaved ? "fill-pending text-pending" : ""}`}
        />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2" align="end">
        {playlists === null ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-4 animate-spin text-text-muted" />
          </div>
        ) : (
          <>
            <p className="px-2 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Save to
            </p>

            {playlists.length === 0 && (
              <button
                type="button"
                onClick={() => toggle(null)}
                disabled={pendingId !== null}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <Bookmark className="size-4 text-pending" />
                Favorites
              </button>
            )}

            <div className="max-h-56 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => toggle(playlist)}
                  disabled={pendingId !== null}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {playlist.name === "Favorites" ? (
                      <Bookmark className="size-4 flex-shrink-0 text-pending" />
                    ) : (
                      <span className="size-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{playlist.name}</span>
                  </span>
                  {pendingId === playlist.id ? (
                    <Loader2 className="size-4 animate-spin flex-shrink-0" />
                  ) : (
                    playlist.contains && (
                      <Check className="size-4 text-success flex-shrink-0" />
                    )
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={create} className="flex gap-1.5 border-t border-border pt-2 mt-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New list..."
                maxLength={50}
                className="h-8 text-sm"
              />
              <Button type="submit" size="icon" className="size-8" disabled={creating || !newName.trim()}>
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              </Button>
            </form>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
