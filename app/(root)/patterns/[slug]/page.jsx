import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPatternBySlug } from "@/modules/patterns/actions";
import ProblemRow from "@/modules/problems/components/problem-row";

export const dynamic = "force-dynamic";

const PatternDetailPage = async ({ params }) => {
  const { slug } = await params;
  const { data: pattern, success } = await getPatternBySlug(slug);

  if (!success || !pattern) notFound();

  const solvedCount = pattern.problems.filter(
    (problem) => problem.solvedBy?.length > 0
  ).length;

  return (
    <div className="w-full min-h-screen bg-bg-base pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/patterns"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          All patterns
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: pattern.color ?? "#71717A" }}
          />
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">
            {pattern.name}
          </h1>
        </div>

        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mb-3">
          {pattern.description}
        </p>

        <p className="text-sm text-text-muted font-mono mb-12">
          {solvedCount} of {pattern.problems.length} solved
        </p>

        {pattern.problems.length === 0 ? (
          <div className="py-20 text-center border border-border rounded-xl bg-bg-surface">
            <p className="text-text-muted">
              No problems tagged with this pattern yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col border-t border-border">
            {pattern.problems.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                solved={problem.solvedBy?.length > 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternDetailPage;
