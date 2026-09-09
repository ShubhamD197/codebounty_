import ProgressRing from "@/modules/playlists/components/progress-ring";

const TIERS = [
  { key: "EASY", label: "Easy", color: "var(--success)" },
  { key: "MEDIUM", label: "Med.", color: "var(--pending)" },
  { key: "HARD", label: "Hard", color: "var(--error)" },
];

/** The donut plus one bar per difficulty, as on a LeetCode profile. */
export default function SolvedSummary({ solvedByDifficulty, totals }) {
  const solved = TIERS.reduce((sum, tier) => sum + solvedByDifficulty[tier.key], 0);
  const total = TIERS.reduce((sum, tier) => sum + totals[tier.key], 0);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-6">
      <h2 className="text-sm font-semibold text-text-primary mb-5">Solved Problems</h2>
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <ProgressRing solved={solved} total={total} size={150} arc={1} />

        <div className="flex-1 w-full space-y-4">
          {TIERS.map((tier) => {
            const done = solvedByDifficulty[tier.key];
            const available = totals[tier.key];
            const percent = available > 0 ? (done / available) * 100 : 0;

            return (
              <div key={tier.key}>
                <div className="flex justify-between items-baseline mb-1.5 text-xs">
                  <span className="font-medium" style={{ color: tier.color }}>
                    {tier.label}
                  </span>
                  <span className="font-mono text-text-secondary">
                    {done}/{available}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${percent}%`, backgroundColor: tier.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
