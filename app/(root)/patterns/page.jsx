import React from "react";
import Link from "next/link";
import { getAllPatterns } from "@/modules/patterns/actions";
import { progressPercent } from "@/modules/patterns/progress";
import PageShell from "@/components/page-shell";

export const dynamic = "force-dynamic";

const PatternsPage = async () => {
  const { data: patterns, error } = await getAllPatterns();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-error">Error loading patterns: {error}</p>
      </div>
    );
  }

  return (
    <PageShell>
        <div className="mb-16">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-4">
            Patterns
          </h1>
          <p className="text-sm text-text-muted max-w-2xl">
            Most problems are one of a few dozen ideas wearing a costume. Learn
            the idea once, then recognise it everywhere.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((pattern) => {
            const pct = progressPercent(pattern.solvedCount, pattern.problemCount);

            return (
              <Link key={pattern.id} href={`/patterns/${pattern.slug}`}>
                <div className="group h-full flex flex-col bg-bg-surface border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className="size-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pattern.color ?? "#71717A" }}
                    />
                    <h2 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                      {pattern.name}
                    </h2>
                  </div>

                  <p className="text-sm text-text-muted leading-relaxed flex-1">
                    {pattern.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex justify-between items-baseline mb-2 text-xs">
                      <span className="text-text-secondary font-mono">
                        {pattern.solvedCount} / {pattern.problemCount} solved
                      </span>
                      <span className="text-text-muted font-mono">{pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pattern.color ?? "#8B5CF6",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
    </PageShell>
  );
};

export default PatternsPage;
