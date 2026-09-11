const WIDTHS = {
  // Named rather than interpolated: Tailwind scans source text for class
  // names, so a template literal would produce no CSS at all.
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
};

/**
 * The single place page padding and measure are decided.
 *
 * Five pages each carried their own copy of
 * `min-h-screen bg-bg-base pt-32 pb-16 px-4 sm:px-6 lg:px-8`, with max widths
 * drifting between 4xl, 6xl and 7xl and the dashboard using pt-28. That drift
 * was the reason no two pages lined up.
 *
 * The top padding clears the navbar and is the only place that number is
 * written down.
 */
export default function PageShell({ width = "default", className = "", children }) {
  return (
    <div className={`px-5 pt-24 pb-20 sm:px-8 ${className}`}>
      <div className={`mx-auto ${WIDTHS[width] ?? WIDTHS.default}`}>{children}</div>
    </div>
  );
}
