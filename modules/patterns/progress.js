/**
 * Pure progress helpers, kept out of the "use server" action module so they can
 * be exercised without a database or a Clerk session.
 */

/**
 * Tallies solved problems per pattern id.
 *
 * @param {Array<{problem?: {primaryPatternId?: string|null}}>} solvedRows
 * @returns {Record<string, number>}
 */
export function tallyByPattern(solvedRows) {
  return solvedRows.reduce((counts, row) => {
    const patternId = row?.problem?.primaryPatternId;
    if (patternId) counts[patternId] = (counts[patternId] ?? 0) + 1;
    return counts;
  }, {});
}

/**
 * Solved percentage, floored at 0 and safe when a pattern has no problems yet -
 * which is the common case for a freshly seeded catalogue.
 */
export function progressPercent(solved, total) {
  if (!total || total < 0) return 0;
  return Math.round((solved / total) * 100);
}
