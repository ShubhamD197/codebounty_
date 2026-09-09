"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addProblemToPlaylist, getUserPlaylists } from "@/modules/playlists/actions";
import CreatePlaylistButton from "./create-playlist-button";

/** "Save to list" on the problem page. Signed-out users never see it. */
export default function AddToPlaylistButton({ problemId }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const load = async () => {
    const result = await getUserPlaylists();
    setPlaylists(result.data ?? []);
  };

  useEffect(() => {
    if (open && playlists === null) load();
  }, [open, playlists]);

  const add = async (playlist) => {
    setPendingId(playlist.id);
    const result = await addProblemToPlaylist(problemId, playlist.id);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.alreadyPresent
        ? `Already in "${playlist.name}"`
        : `Saved to "${playlist.name}"`
    );
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        onClick={() => setOpen(true)}
      >
        <Bookmark className="size-4" />
        <span className="hidden sm:inline">Save</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to playlist</DialogTitle>
            <DialogDescription>
              Pick a list, or create a new one.
            </DialogDescription>
          </DialogHeader>

          {playlists === null ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-text-muted" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-text-muted">
                You don&apos;t have any playlists yet.
              </p>
              <CreatePlaylistButton
                trigger={<Button variant="outline">Create your first playlist</Button>}
                onCreated={load}
              />
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-72 pr-3">
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{playlist.name}</p>
                        <p className="text-xs text-text-muted">
                          {playlist._count.problems} problems
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingId !== null}
                        onClick={() => add(playlist)}
                      >
                        {pendingId === playlist.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <CreatePlaylistButton
                trigger={
                  <Button variant="ghost" className="w-full">
                    New playlist
                  </Button>
                }
                onCreated={load}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
