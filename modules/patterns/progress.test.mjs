// Run: node modules/patterns/progress.test.mjs
import assert from "node:assert/strict";
import { tallyByPattern, progressPercent } from "./progress.js";

// tallyByPattern
assert.deepEqual(tallyByPattern([]), {}, "empty input yields no counts");

assert.deepEqual(
  tallyByPattern([
    { problem: { primaryPatternId: "dp" } },
    { problem: { primaryPatternId: "dp" } },
    { problem: { primaryPatternId: "tp" } },
  ]),
  { dp: 2, tp: 1 },
  "counts group by pattern id"
);

assert.deepEqual(
  tallyByPattern([
    { problem: { primaryPatternId: null } },
    { problem: {} },
    {},
    { problem: { primaryPatternId: "dp" } },
  ]),
  { dp: 1 },
  "problems with no pattern are ignored, not counted under undefined"
);

// progressPercent - the seeded catalogue starts with most patterns at 0 problems
assert.equal(progressPercent(0, 0), 0, "0/0 is 0%, not NaN");
assert.equal(progressPercent(5, 0), 0, "solved with no total is still 0%");
assert.equal(progressPercent(1, 2), 50);
assert.equal(progressPercent(2, 2), 100);
assert.equal(progressPercent(1, 3), 33, "rounds to nearest integer");

console.log("progress: all assertions passed");
