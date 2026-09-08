import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { progressPercent } from "@/modules/patterns/progress";

/**
 * Pattern-wise progress for the profile.
 *
 * Patterns with no problems yet are hidden - an empty catalogue entry says
 * nothing about the user's strengths and would bury the ones that do.
 * Weakest-first ordering so the useful next thing to practise is at the top.
 */
const PatternProgress = ({ patterns = [] }) => {
  const withProblems = patterns
    .filter((pattern) => pattern.problemCount > 0)
    .sort((a, b) => {
      const byProgress =
        progressPercent(a.solvedCount, a.problemCount) -
        progressPercent(b.solvedCount, b.problemCount);
      return byProgress !== 0 ? byProgress : a.name.localeCompare(b.name);
    });

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Progress by pattern
        </h2>
        <Link
          href="/patterns"
          className="text-sm text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1"
        >
          All patterns <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {withProblems.length === 0 ? (
        <div className="py-12 text-center border border-border rounded-xl bg-bg-surface">
          <p className="text-text-muted text-sm">
            No problems have been assigned to a pattern yet.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-bg-surface divide-y divide-border overflow-hidden">
          {withProblems.map((pattern) => {
            const pct = progressPercent(
              pattern.solvedCount,
              pattern.problemCount
            );

            return (
              <Link key={pattern.id} href={`/patterns/${pattern.slug}`}>
                <div className="group flex items-center gap-4 px-5 py-3.5 hover:bg-bg-elevated transition-colors">
                  <span
                    className="size-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pattern.color ?? "#71717A" }}
                  />

                  <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors w-48 truncate">
                    {pattern.name}
                  </span>

                  <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden min-w-16">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pattern.color ?? "#8B5CF6",
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono text-text-muted w-16 text-right tabular-nums">
                    {pattern.solvedCount}/{pattern.problemCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatternProgress;
