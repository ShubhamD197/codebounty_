"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/modules/problems/components/problem-row";
import PlaylistCard from "@/modules/playlists/components/playlist-card";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "3 hours ago". Falls back to a date past a week, where relative stops helping. */
const timeAgo = (value) => {
  const elapsed = Date.now() - new Date(value).getTime();
  if (elapsed < HOUR) return `${Math.max(1, Math.round(elapsed / MINUTE))} min ago`;
  if (elapsed < DAY) return `${Math.round(elapsed / HOUR)} hours ago`;
  if (elapsed < 7 * DAY) return `${Math.round(elapsed / DAY)} days ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const statusIcon = (status) => {
  if (status === "Accepted") return <CheckCircle2 className="size-4 text-success" />;
  if (status?.includes("Time")) return <Clock className="size-4 text-pending" />;
  return <XCircle className="size-4 text-error" />;
};

function ProblemLine({ problem, right }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border last:border-0">
      {problem ? (
        <Link
          href={`/problem/${problem.id}`}
          className="text-sm text-text-primary hover:text-accent transition-colors truncate"
        >
          <span className="font-mono text-text-muted mr-1.5">{problem.number}.</span>
          {problem.title}
        </Link>
      ) : (
        <span className="text-sm text-text-muted truncate">Deleted problem</span>
      )}
      <div className="flex items-center gap-3 flex-shrink-0">{right}</div>
    </div>
  );
}

function EmptyState({ children }) {
  return <p className="py-12 text-center text-sm text-text-muted">{children}</p>;
}

export default function ProfileActivity({ solvedProblems, submissions, playlists }) {
  const recentAccepted = submissions.filter((sub) => sub.status === "Accepted").slice(0, 15);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <Tabs defaultValue="recent">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent AC</TabsTrigger>
          <TabsTrigger value="solved">Solved ({solvedProblems.length})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="playlists">Playlists ({playlists.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          {recentAccepted.length === 0 ? (
            <EmptyState>No accepted submissions yet.</EmptyState>
          ) : (
            recentAccepted.map((sub) => (
              <ProblemLine
                key={sub.id}
                problem={sub.problem}
                right={
                  <span className="text-xs text-text-muted">{timeAgo(sub.createdAt)}</span>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="solved">
          {solvedProblems.length === 0 ? (
            <EmptyState>Nothing solved yet. Pick a pattern and start.</EmptyState>
          ) : (
            solvedProblems.map((solved) => (
              <ProblemLine
                key={solved.id}
                problem={solved.problem}
                right={
                  solved.problem && (
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono border ${getDifficultyColor(solved.problem.difficulty)}`}
                    >
                      {solved.problem.difficulty.charAt(0) +
                        solved.problem.difficulty.slice(1).toLowerCase()}
                    </Badge>
                  )
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="submissions">
          {submissions.length === 0 ? (
            <EmptyState>No submissions yet.</EmptyState>
          ) : (
            submissions.slice(0, 50).map((sub) => (
              <ProblemLine
                key={sub.id}
                problem={sub.problem}
                right={
                  <>
                    <span className="font-mono text-[11px] text-text-muted capitalize hidden sm:inline">
                      {(sub.language || "").toLowerCase()}
                    </span>
                    <span className="text-xs text-text-muted">{timeAgo(sub.createdAt)}</span>
                    {statusIcon(sub.status)}
                  </>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="playlists">
          {playlists.length === 0 ? (
            <EmptyState>No playlists yet.</EmptyState>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
