"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Code2,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProblemsTable({ problems = [], user }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const tagsSet = new Set();
    problems.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [problems]);

  const difficulties = ["EASY", "MEDIUM", "HARD"];

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems
      .filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((problem) =>
        difficulty === "ALL" ? true : problem.difficulty === difficulty
      )
      .filter((problem) =>
        selectedTag === "ALL" ? true : problem.tags?.includes(selectedTag)
      );
  }, [problems, search, difficulty, selectedTag]);

  const getDifficultyColor = (diff) => {
    switch (diff) {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full flex flex-col">
      {/* HEADER: Mini Hero (Generous Spacing) */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
          Algorithm Catalog
        </h1>
        <p className="text-lg text-text-muted max-w-2xl">
          Explore and master essential data structures and patterns. Filter by difficulty, tag, or search directly for a challenge.
        </p>

        {/* Filters & Search */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-bg-surface border-border text-text-primary placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-all rounded-xl"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Difficulty Toggle */}
            <div className="flex bg-bg-surface border border-border p-1 rounded-xl h-12 items-center">
              <button
                onClick={() => setDifficulty("ALL")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  difficulty === "ALL" ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-primary"
                }`}
              >
                All
              </button>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    difficulty === diff ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {diff.toLowerCase()}
                </button>
              ))}
            </div>
            
            {/* Simple Tag Select (if tags exist) */}
            {allTags.length > 0 && (
              <select 
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="h-12 bg-bg-surface border border-border text-text-secondary text-sm rounded-xl px-4 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="ALL">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* PROBLEM LIST: Data Dense (Tight Spacing) */}
      <div className="w-full">
        {/* Desktop Header Row */}
        <div className="hidden md:grid grid-cols-[40px_1fr_120px_200px] gap-4 px-4 py-3 border-b border-border text-xs font-semibold tracking-wider text-text-muted uppercase">
          <div className="text-center">Status</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Tags</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => {
                const isSolved = problem.solvedBy?.length > 0;
                return (
                  <Link href={`/problem/${problem.id}`} key={problem.id}>
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: (index % 10) * 0.03 }} // Fast stagger
                      whileHover={{ scale: 0.995, backgroundColor: "var(--bg-elevated)" }}
                      className="group grid grid-cols-1 md:grid-cols-[40px_1fr_120px_200px] gap-2 md:gap-4 px-4 py-3 md:py-2.5 border-b border-border items-center cursor-pointer transition-colors"
                    >
                      {/* Mobile Title Row */}
                      <div className="md:hidden flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {isSolved ? (
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          ) : (
                            <div className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="font-medium text-text-primary text-base">
                            {problem.title}
                          </span>
                        </div>
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </Badge>
                      </div>
                      
                      {/* Mobile Tags Row */}
                      <div className="md:hidden pl-6">
                        <div className="flex flex-wrap gap-1.5">
                          {(problem.tags || []).slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs text-text-muted bg-bg-surface px-2 py-0.5 rounded-md border border-border">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:flex justify-center">
                        {isSolved ? (
                          <CheckCircle2 className="h-5 w-5 text-success group-hover:scale-110 transition-transform" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-border/50 group-hover:border-accent/50 transition-colors"></div>
                        )}
                      </div>
                      <div className="hidden md:flex font-medium text-text-primary text-sm group-hover:text-accent transition-colors truncate pr-4">
                        {problem.title}
                      </div>
                      <div className="hidden md:flex">
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-medium tracking-tight border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      <div className="hidden md:flex flex-wrap gap-1.5 items-center">
                        {(problem.tags || []).slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[11px] font-mono text-text-muted bg-bg-surface px-2 py-0.5 rounded border border-border">
                            {tag}
                          </span>
                        ))}
                        {(problem.tags?.length || 0) > 3 && (
                          <span className="text-[11px] text-text-muted">+{problem.tags.length - 3}</span>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-6">
                  <FolderOpen className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No problems found</h3>
                <p className="text-text-muted max-w-sm">
                  We couldn't find any problems matching your current filters. Try adjusting your search criteria.
                </p>
                <button 
                  onClick={() => { setSearch(""); setDifficulty("ALL"); setSelectedTag("ALL"); }}
                  className="mt-6 text-sm text-accent hover:text-accent-hover font-medium"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}