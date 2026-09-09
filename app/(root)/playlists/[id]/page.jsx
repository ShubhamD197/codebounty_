import Link from "next/link";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlaylistById, getSavedProblemIds } from "@/modules/playlists/actions";
import ProgressRing from "@/modules/playlists/components/progress-ring";
import PlaylistProblems from "@/modules/playlists/components/playlist-problems";
import DeletePlaylistButton from "@/modules/playlists/components/delete-playlist-button";
import AddProblemsDialog from "@/modules/playlists/components/add-problems-dialog";

export const dynamic = "force-dynamic";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const DIFFICULTY_STYLES = {
  EASY: "text-success",
  MEDIUM: "text-pending",
  HARD: "text-error",
};

const PlaylistDetailPage = async ({ params }) => {
  const { id } = await params;
  const [{ data: playlist }, savedIds] = await Promise.all([
    getPlaylistById(id),
    getSavedProblemIds(),
  ]);

  if (!playlist) notFound();

  const problems = playlist.problems.map((entry) => entry.problem);
  const isSolved = (problem) => problem.solvedBy.length > 0;

  const solved = problems.filter(isSolved).length;
  const owner = [playlist.user.firstName, playlist.user.lastName]
    .filter(Boolean)
    .join(" ");

  // First unsolved problem, so Practice resumes rather than restarting.
  const nextProblem = problems.find((problem) => !isSolved(problem)) ?? problems[0];

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <section className="xl:w-80 xl:flex-shrink-0 rounded-xl border border-border bg-bg-surface p-6">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary break-words">
          {playlist.name}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {owner || "You"} · {problems.length}{" "}
          {problems.length === 1 ? "question" : "questions"}
        </p>
        {playlist.description && (
          <p className="mt-3 text-sm text-text-secondary">{playlist.description}</p>
        )}

        <div className="mt-5 flex items-center gap-2">
          {/* An empty list has nothing to practise, and a disabled link is not
              a thing, so the button only becomes a link when there is a target. */}
          {nextProblem ? (
            <Button
              className="gap-2"
              nativeButton={false}
              render={<Link href={`/problem/${nextProblem.id}`} />}
            >
              <Play className="size-4" />
              Practice
            </Button>
          ) : (
            <Button className="gap-2" disabled>
              <Play className="size-4" />
              Practice
            </Button>
          )}
          <AddProblemsDialog
            playlistId={playlist.id}
            playlistName={playlist.name}
            presentIds={problems.map((problem) => problem.id)}
          />
          <DeletePlaylistButton playlistId={playlist.id} name={playlist.name} />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Progress</h2>
          <div className="flex items-center gap-5">
            <ProgressRing solved={solved} total={problems.length} size={140} />
            <div className="flex flex-col gap-2 flex-1">
              {DIFFICULTIES.map((difficulty) => {
                const inTier = problems.filter((p) => p.difficulty === difficulty);
                return (
                  <div
                    key={difficulty}
                    className="rounded-lg bg-bg-elevated px-3 py-2 text-center"
                  >
                    <p
                      className={`text-xs font-medium capitalize ${DIFFICULTY_STYLES[difficulty]}`}
                    >
                      {difficulty.toLowerCase()}
                    </p>
                    <p className="text-sm font-mono text-text-primary">
                      {inTier.filter(isSolved).length}/{inTier.length}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 min-w-0">
        <PlaylistProblems
          playlistId={playlist.id}
          playlistName={playlist.name}
          problems={problems}
          savedIds={savedIds}
        />
      </section>
    </div>
  );
};

export default PlaylistDetailPage;
