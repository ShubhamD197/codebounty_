import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPatternBySlug } from "@/modules/patterns/actions";

export const dynamic = "force-dynamic";

const getDifficultyColor = (difficulty) => {
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
              <Link href={`/problem/${problem.id}`} key={problem.id}>
                <div className="group grid grid-cols-[32px_1fr_auto] gap-4 items-center px-4 py-3 border-b border-border hover:bg-bg-elevated transition-colors">
                  <div className="flex justify-center">
                    {problem.solvedBy?.length > 0 ? (
                      <CheckCircle2 className="size-5 text-success" />
                    ) : (
                      <div className="size-5 rounded-full border border-border/50 group-hover:border-accent/50 transition-colors" />
                    )}
                  </div>
                  <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                    {problem.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-0.5 text-xs font-mono border ${getDifficultyColor(problem.difficulty)}`}
                  >
                    {problem.difficulty.charAt(0) +
                      problem.difficulty.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternDetailPage;
