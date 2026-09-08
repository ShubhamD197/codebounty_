// Seeds the pattern catalogue from PRD section 10.
//
// Idempotent: upserts by slug, so it is safe to re-run after adding a pattern.
// Deliberately does not delete patterns that are no longer listed here - a
// pattern may already be referenced by problems.
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient({
  // Seeding is a migration-adjacent task, so use the unpooled endpoint.
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

const PATTERNS = [
  {
    slug: "sliding-window",
    name: "Sliding Window",
    order: 10,
    color: "#8B5CF6",
    icon: "RectangleHorizontal",
    description:
      "Track a contiguous range over an array or string and move its edges instead of recomputing from scratch. Turns many O(n^2) scans into a single pass.",
  },
  {
    slug: "two-pointers",
    name: "Two Pointers",
    order: 20,
    color: "#6366F1",
    icon: "ArrowLeftRight",
    description:
      "Walk two indices toward or alongside each other, usually over sorted input, to find pairs or partitions without nesting loops.",
  },
  {
    slug: "prefix-sum",
    name: "Prefix Sum",
    order: 30,
    color: "#0EA5E9",
    icon: "Sigma",
    description:
      "Precompute cumulative totals so any range query becomes a single subtraction. The base trick behind many subarray problems.",
  },
  {
    slug: "binary-search",
    name: "Binary Search on Answer",
    order: 40,
    color: "#14B8A6",
    icon: "Search",
    description:
      "Binary search the space of possible answers rather than the input, using a feasibility check as the predicate. Applies whenever the check is monotonic.",
  },
  {
    slug: "fast-and-slow-pointers",
    name: "Fast and Slow Pointers",
    order: 50,
    color: "#22C55E",
    icon: "Repeat",
    description:
      "Advance two pointers at different speeds to detect cycles, find midpoints, or locate a cycle's entry in constant space.",
  },
  {
    slug: "monotonic-stack",
    name: "Monotonic Stack",
    order: 60,
    color: "#84CC16",
    icon: "Layers",
    description:
      "Maintain a stack whose values stay sorted, popping as you go, to answer next-greater and previous-smaller questions in linear time.",
  },
  {
    slug: "heap-priority-queue",
    name: "Heap / Priority Queue",
    order: 70,
    color: "#EAB308",
    icon: "ListOrdered",
    description:
      "Keep the largest or smallest element reachable in O(log n). The default tool for top-k, streaming medians, and merging sorted inputs.",
  },
  {
    slug: "bfs-dfs",
    name: "BFS / DFS",
    order: 80,
    color: "#F59E0B",
    icon: "Network",
    description:
      "Systematic graph and tree traversal. BFS gives shortest paths in unweighted graphs; DFS suits connectivity, cycles, and topological order.",
  },
  {
    slug: "backtracking",
    name: "Backtracking",
    order: 90,
    color: "#F97316",
    icon: "GitBranch",
    description:
      "Build candidates incrementally and abandon a branch as soon as it cannot lead to a solution. The basis for permutations, subsets, and constraint puzzles.",
  },
  {
    slug: "greedy",
    name: "Greedy",
    order: 100,
    color: "#EF4444",
    icon: "TrendingUp",
    description:
      "Take the locally best choice at each step. Fast and simple when an exchange argument proves the local choice is globally safe.",
  },
  {
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    order: 110,
    color: "#EC4899",
    icon: "Grid3x3",
    description:
      "Break a problem into overlapping subproblems and reuse their answers. Recognising the state and transition is most of the work.",
  },
];

/**
 * Gives pre-Pattern problems a primaryPattern by matching their free-text tags
 * against pattern names.
 *
 * Only fills in problems where primaryPatternId is still null, so it never
 * overwrites a pattern an admin picked, and re-running is a no-op.
 */
async function backfillProblemPatterns() {
  const [patterns, problems] = await Promise.all([
    db.pattern.findMany({ select: { id: true, name: true } }),
    db.problem.findMany({
      where: { primaryPatternId: null },
      select: { id: true, title: true, tags: true },
    }),
  ]);

  const byName = new Map(patterns.map((p) => [p.name.toLowerCase(), p.id]));
  let matched = 0;

  for (const problem of problems) {
    const patternId = problem.tags
      .map((tag) => byName.get(tag.toLowerCase()))
      .find(Boolean);

    if (!patternId) {
      console.warn(`  no pattern matched for "${problem.title}" - set it manually`);
      continue;
    }

    await db.problem.update({
      where: { id: problem.id },
      data: { primaryPatternId: patternId },
    });
    matched += 1;
  }

  return { matched, skipped: problems.length - matched };
}

async function main() {
  for (const pattern of PATTERNS) {
    await db.pattern.upsert({
      where: { slug: pattern.slug },
      update: pattern,
      create: pattern,
    });
  }
  console.log(`Seeded ${PATTERNS.length} patterns.`);

  const { matched, skipped } = await backfillProblemPatterns();
  console.log(`Backfilled ${matched} problem(s); ${skipped} left unassigned.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
