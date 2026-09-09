"use client";

import React, { useState, useMemo } from "react";
import { Search, FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import ProblemRow from "./problem-row";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

/** Matches on number as well as title, so typing "121" jumps to problem 121. */
export const matchesQuery = (problem, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    problem.title.toLowerCase().includes(q) ||
    String(problem.number ?? "").startsWith(q)
  );
};

export default function ProblemsTable({ problems = [], user, savedIds = [] }) {
  const saved = useMemo(() => new Set(savedIds), [savedIds]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [patternSlug, setPatternSlug] = useState("ALL");

  // Patterns present in the current problem set, in catalogue order.
  const availablePatterns = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const bySlug = new Map();
    problems.forEach((p) => {
      if (p.primaryPattern) bySlug.set(p.primaryPattern.slug, p.primaryPattern);
    });
    return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [problems]);

  const filteredProblems = useMemo(
    () =>
      problems
        .filter((problem) => matchesQuery(problem, search))
        .filter((problem) => difficulty === "ALL" || problem.difficulty === difficulty)
        .filter(
          (problem) =>
            patternSlug === "ALL" || problem.primaryPattern?.slug === patternSlug
        ),
    [problems, search, difficulty, patternSlug]
  );

  const solvedCount = problems.filter((p) => p.solvedBy?.length > 0).length;

  return (
    <div className="w-full flex flex-col">
      <div className="mb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
              Algorithm Catalog
            </h1>
            <p className="text-lg text-text-muted max-w-2xl">
              Practice by pattern, not at random. Filter by the technique a problem
              teaches, by difficulty, or search directly.
            </p>
          </div>
          {problems.length > 0 && (
            <p className="text-sm text-text-muted font-mono">
              {solvedCount}/{problems.length} solved
            </p>
          )}
        </div>

        {/* Filters & Search */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search by title or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-bg-surface border-border text-text-primary placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all rounded-xl"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex bg-bg-surface border border-border p-1 rounded-xl h-12 items-center">
              {["ALL", ...DIFFICULTIES].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    difficulty === diff
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {diff === "ALL" ? "All" : diff.toLowerCase()}
                </button>
              ))}
            </div>

            {/* Pattern is the primary browse axis; tags are secondary metadata. */}
            {availablePatterns.length > 0 && (
              <select
                value={patternSlug}
                onChange={(e) => setPatternSlug(e.target.value)}
                className="h-12 bg-bg-surface border border-border text-text-secondary text-sm rounded-xl px-4 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="ALL">All Patterns</option>
                {availablePatterns.map((pattern) => (
                  <option key={pattern.slug} value={pattern.slug}>
                    {pattern.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="hidden md:grid grid-cols-[40px_1fr_120px_200px_auto] gap-4 px-4 py-3 border-b border-border text-xs font-semibold tracking-wider text-text-muted uppercase">
          <div className="text-center">Status</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Pattern</div>
          <div className="min-w-[40px]" />
        </div>

        <div className="flex flex-col">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                solved={problem.solvedBy?.length > 0}
                showSave={Boolean(user)}
                saved={saved.has(problem.id)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-6">
                <FolderOpen className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No problems found
              </h3>
              <p className="text-text-muted max-w-sm">
                We couldn&apos;t find any problems matching your current filters. Try
                adjusting your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setDifficulty("ALL");
                  setPatternSlug("ALL");
                }}
                className="mt-6 text-sm text-accent hover:text-accent-hover font-medium"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
