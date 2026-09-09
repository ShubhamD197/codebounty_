import Link from "next/link";

/**
 * LeetCode groups this card by tag under Advanced / Intermediate / Fundamental.
 * We already have a better axis for it: patterns, which are the app's primary
 * browse dimension and carry a learning order.
 */
export default function PatternSkills({ patterns, solvedByPattern }) {
  const rows = patterns
    .filter((pattern) => pattern._count.problems > 0)
    .map((pattern) => ({
      ...pattern,
      solved: solvedByPattern[pattern.id] ?? 0,
      total: pattern._count.problems,
    }));

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-4">Patterns</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">No patterns in the catalogue yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((pattern) => (
            <li key={pattern.id}>
              <Link href={`/patterns/${pattern.slug}`} className="group block">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="inline-flex items-center gap-2 text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                    <span
                      className="size-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pattern.color ?? "var(--text-muted)" }}
                    />
                    <span className="truncate">{pattern.name}</span>
                  </span>
                  <span className="text-xs font-mono text-text-muted flex-shrink-0">
                    {pattern.solved}/{pattern.total}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${(pattern.solved / pattern.total) * 100}%`,
                      backgroundColor: pattern.color ?? "var(--accent)",
                    }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
