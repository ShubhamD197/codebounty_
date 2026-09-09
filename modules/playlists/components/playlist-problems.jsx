"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProblemRow from "@/modules/problems/components/problem-row";
import { matchesQuery } from "@/modules/problems/components/problem-table";
import { removeProblemFromPlaylist } from "@/modules/playlists/actions";
import AddProblemsDialog from "./add-problems-dialog";

export default function PlaylistProblems({
  playlistId,
  playlistName,
  problems,
  savedIds = [],
}) {
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(
    () => problems.filter((problem) => matchesQuery(problem, search)),
    [problems, search]
  );

  const remove = (problem) => {
    startTransition(async () => {
      const result = await removeProblemFromPlaylist(problem.id, playlistId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Removed "${problem.title}"`);
      router.refresh();
    });
  };

  if (problems.length === 0) {
    return (
      <div className="py-24 text-center border border-border rounded-xl bg-bg-surface">
        <p className="text-text-muted mb-4">This playlist is empty.</p>
        <div className="flex items-center justify-center gap-2">
          <AddProblemsDialog
            playlistId={playlistId}
            playlistName={playlistName}
            presentIds={[]}
          />
          <Button variant="outline" nativeButton={false} render={<Link href="/problems" />}>
            Browse the catalogue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          placeholder="Search questions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 bg-bg-surface border-border rounded-xl"
        />
      </div>

      <div className="flex flex-col border-t border-border">
        {filtered.map((problem) => (
          <ProblemRow
            key={problem.id}
            problem={problem}
            solved={problem.solvedBy.length > 0}
            showSave
            saved={savedSet.has(problem.id)}
            trailing={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-text-muted hover:text-error"
                aria-label={`Remove ${problem.title} from playlist`}
                disabled={pending}
                onClick={() => remove(problem)}
              >
                <X className="size-4" />
              </Button>
            }
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-text-muted">
            No questions match &quot;{search}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
