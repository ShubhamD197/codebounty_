"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "bg-success/10 text-success border-success/20";
    case "MEDIUM":
      return "bg-pending/10 text-pending border-pending/20";
    case "HARD":
      return "bg-error/10 text-error border-error/20";
    default:
      return "bg-bg-elevated text-text-secondary border-border";
  }
};

/**
 * One row of the problem catalogue. Shared by /problems and /playlists/[id] so
 * the two lists cannot drift apart.
 *
 * `trailing` is where a caller hangs list-specific controls (remove from
 * playlist, for example) without this component knowing about them.

 */
export default function ProblemRow({
  problem,
  solved = false,
  trailing = null,
}) {
  return (
    <div className="group grid grid-cols-1 md:grid-cols-[40px_1fr_120px_200px_auto] gap-2 md:gap-4 px-4 py-3 md:py-2.5 border-b border-border items-center transition-colors hover:bg-bg-elevated">
      {/* Mobile: title, difficulty and controls on one line. */}
      <div className="md:hidden flex items-center gap-2">
        <Link
          href={`/problem/${problem.id}`}
          className="flex items-center gap-2 min-w-0 flex-1"
        >
          {solved ? (
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
          ) : (
            <span className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="font-medium text-text-primary text-base truncate">
            {problem.number != null && (
              <span className="text-text-muted font-mono mr-1">{problem.number}.</span>
            )}
            {problem.title}
          </span>
        </Link>
        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase flex-shrink-0 ${getDifficultyColor(problem.difficulty)}`}
        >
          {problem.difficulty}
        </Badge>
        {trailing}
      </div>

      <div className="md:hidden pl-6 flex flex-wrap gap-1.5 items-center">
        {problem.primaryPattern && <PatternChip pattern={problem.primaryPattern} />}
        {(problem.tags || []).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-xs text-text-muted bg-bg-surface px-2 py-0.5 rounded-md border border-border"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex justify-center">
        {solved ? (
          <CheckCircle2 className="h-5 w-5 text-success group-hover:scale-110 transition-transform" />
        ) : (
          <div className="h-5 w-5 rounded-full border border-border/50 group-hover:border-accent/50 transition-colors" />
        )}
      </div>
      <Link
        href={`/problem/${problem.id}`}
        className="hidden md:block font-medium text-text-primary text-sm group-hover:text-accent transition-colors truncate pr-4"
      >
        {problem.number != null && (
          <span className="text-text-muted font-mono mr-1.5">{problem.number}.</span>
        )}
        {problem.title}
      </Link>
      <div className="hidden md:flex">
        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-medium tracking-tight border ${getDifficultyColor(problem.difficulty)}`}
        >
          {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
        </Badge>
      </div>
      <div className="hidden md:flex items-center min-w-0">
        {problem.primaryPattern ? (
          <PatternChip pattern={problem.primaryPattern} />
        ) : (
          <span className="text-[11px] text-text-muted">—</span>
        )}
      </div>
      <div className="hidden md:flex items-center justify-end gap-1 min-w-[40px]">
        {trailing}
      </div>
    </div>
  );
}

function PatternChip({ pattern }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary bg-bg-surface px-2 py-0.5 rounded border border-border truncate">
      <span
        className="size-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: pattern.color ?? "var(--text-muted)" }}
      />
      {pattern.name}
    </span>
  );
}
