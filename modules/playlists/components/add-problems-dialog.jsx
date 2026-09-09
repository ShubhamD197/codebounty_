"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllProblems } from "@/modules/problems/actions";
import { getDifficultyColor } from "@/modules/problems/components/problem-row";
import { matchesQuery } from "@/modules/problems/components/problem-table";
import { toggleProblemInPlaylist } from "@/modules/playlists/actions";

/**
 * Adds problems to a playlist from inside the playlist, rather than making the
 * user go to the catalogue and star them one at a time.
 *
 * The dialog stays open after each add, because adding several in a row is the
 * normal case. `presentIds` starts from the server's list and is updated
 * locally so a just-added row shows its tick immediately.
 */
export default function AddProblemsDialog({ playlistId, playlistName, presentIds }) {
  const [open, setOpen] = useState(false);
  const [problems, setProblems] = useState(null);
  const [search, setSearch] = useState("");
  const [present, setPresent] = useState(() => new Set(presentIds));
  const [pendingId, setPendingId] = useState(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setPresent(new Set(presentIds));
  }, [presentIds]);

  useEffect(() => {
    if (!open || problems !== null) return;
    getAllProblems().then((result) => setProblems(result.success ? result.data : []));
  }, [open, problems]);

  const filtered = useMemo(
    () => (problems ?? []).filter((problem) => matchesQuery(problem, search)),
    [problems, search]
  );

  const toggle = async (problem) => {
    setPendingId(problem.id);
    const result = await toggleProblemInPlaylist(problem.id, playlistId);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setPresent((current) => {
      const next = new Set(current);
      if (result.added) next.add(problem.id);
      else next.delete(problem.id);
      return next;
    });
    startTransition(() => router.refresh());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <Plus className="size-4" />
        Add problems
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to &quot;{playlistName}&quot;</DialogTitle>
          <DialogDescription>
            Search the catalogue and tap a problem to add or remove it.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or number..."
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto -mx-1 px-1">
          {problems === null ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-text-muted" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-muted">
              No problems match that search.
            </p>
          ) : (
            filtered.map((problem) => {
              const added = present.has(problem.id);
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => toggle(problem)}
                  disabled={pendingId !== null}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-bg-elevated transition-colors"
                >
                  <span className="text-sm text-text-primary truncate">
                    <span className="font-mono text-text-muted mr-1.5">
                      {problem.number}.
                    </span>
                    {problem.title}
                  </span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono border ${getDifficultyColor(problem.difficulty)}`}
                    >
                      {problem.difficulty.charAt(0) +
                        problem.difficulty.slice(1).toLowerCase()}
                    </Badge>
                    {pendingId === problem.id ? (
                      <Loader2 className="size-4 animate-spin text-text-muted" />
                    ) : added ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Plus className="size-4 text-text-muted" />
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
