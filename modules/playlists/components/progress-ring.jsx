/**
 * Solved-count dial. Plain SVG rather than a chart library: recharts is already
 * in the bundle but a single arc does not need it.
 */
export default function ProgressRing({ solved, total, size = 168, stroke = 10, arc = 0.75 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // arc 0.75 leaves a gap at the bottom, like the playlist reference; pass 1
  // for the closed ring the profile uses.
  const ratio = total > 0 ? solved / total : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className={arc < 1 ? "-rotate-[225deg]" : "-rotate-90"}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * arc} ${circumference}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--success)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * arc * ratio} ${circumference}`}
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-text-primary leading-none">
          {solved}
          <span className="text-base font-medium text-text-muted">/{total}</span>
        </p>
        <p className="mt-1 text-xs text-text-muted">Solved</p>
      </div>
    </div>
  );
}
