import { Code2 } from "lucide-react";

/**
 * LeetCode's "Languages" card. Counts distinct problems solved per language,
 * not submissions: ten attempts at one problem is not ten problems.
 */
export default function LanguageStats({ submissions }) {
  const perLanguage = new Map();

  submissions.forEach((sub) => {
    if (sub.status !== "Accepted" || !sub.problemId) return;
    const language = sub.language || "Unknown";
    if (!perLanguage.has(language)) perLanguage.set(language, new Set());
    perLanguage.get(language).add(sub.problemId);
  });

  const rows = [...perLanguage.entries()]
    .map(([language, problems]) => ({ language, count: problems.size }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-4">Languages</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">No accepted submissions yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(({ language, count }) => (
            <li key={language} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-text-primary">
                <Code2 className="size-3.5 text-text-muted" />
                <span className="capitalize">{language.toLowerCase()}</span>
              </span>
              <span className="text-xs text-text-muted">
                {count} {count === 1 ? "problem" : "problems"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
