"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Submission calendar. Laid out in week columns like GitHub and LeetCode,
 * rather than one long row, so a year fits without horizontal scrolling on a
 * laptop.
 *
 * Extracted from the dashboard, which had the only copy. The profile needs the
 * same thing, and two copies would drift.
 */
export default function ActivityHeatmap({ submissions, weeks = 26 }) {
  const { columns, monthLabels, total, activeDays, maxStreak } = useMemo(() => {
    const counts = new Map();
    submissions.forEach((sub) => {
      const key = startOfDay(sub.createdAt).getTime();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    // End on the Saturday of the current week so the last column is full.
    const end = startOfDay(new Date());
    end.setDate(end.getDate() + (6 - end.getDay()));

    const days = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(end.getDate() - i);
      days.push({ date, count: counts.get(date.getTime()) ?? 0 });
    }

    const columns = [];
    for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

    // One label per column, only where the month changes.
    const monthLabels = columns.map((week, index) => {
      const month = week[0].date.getMonth();
      const previous = index > 0 ? columns[index - 1][0].date.getMonth() : null;
      return month !== previous ? MONTHS[month] : "";
    });

    // Longest run of consecutive days with a submission, over the whole
    // history, not just the window drawn above.
    const sortedKeys = [...counts.keys()].sort((a, b) => a - b);
    const DAY = 86_400_000;
    let maxStreak = 0;
    let run = 0;
    sortedKeys.forEach((key, index) => {
      run = index > 0 && key - sortedKeys[index - 1] === DAY ? run + 1 : 1;
      maxStreak = Math.max(maxStreak, run);
    });

    return {
      columns,
      monthLabels,
      total: submissions.length,
      activeDays: counts.size,
      maxStreak,
    };
  }, [submissions, weeks]);

  // Four buckets, so a heavy day is visibly darker than a one-submission day.
  const level = (count) => {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    return 3;
  };
  const OPACITY = [1, 0.35, 0.65, 1];

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mb-4 text-sm">
        <p className="text-text-primary font-semibold">
          {total} <span className="font-normal text-text-muted">submissions</span>
        </p>
        <p className="text-text-muted">
          Active days <span className="text-text-primary font-medium">{activeDays}</span>
        </p>
        <p className="text-text-muted">
          Max streak <span className="text-text-primary font-medium">{maxStreak}</span>
        </p>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-max">
            <div className="flex gap-1 mb-1">
              {monthLabels.map((label, index) => (
                <span
                  key={index}
                  className="w-3 text-[10px] text-text-muted leading-none"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              {columns.map((week, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-1">
                  {week.map(({ date, count }) => (
                    <Tooltip key={date.getTime()}>
                      <TooltipTrigger
                        className="size-3 rounded-[2px] transition-transform hover:scale-125"
                        style={{
                          backgroundColor:
                            count === 0 ? "var(--bg-elevated)" : "var(--accent)",
                          opacity: OPACITY[level(count)],
                        }}
                      />
                      <TooltipContent className="text-xs">
                        <p className="font-semibold">
                          {count} {count === 1 ? "submission" : "submissions"}
                        </p>
                        <p className="text-text-muted">
                          {date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
