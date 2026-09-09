import axios from "axios";

// One table, both directions. Two separate maps drifted apart before and C++/Go
// submissions ended up stored as language "Unknown".
const LANGUAGES = {
  PYTHON: { id: 71, name: "Python" },
  JAVASCRIPT: { id: 63, name: "JavaScript" },
  TYPESCRIPT: { id: 74, name: "TypeScript" },
  JAVA: { id: 62, name: "Java" },
  CPP: { id: 54, name: "C++" },
  GO: { id: 60, name: "Go" },
};

export function getJudge0LanguageId(language) {
  return LANGUAGES[String(language ?? "").toUpperCase()]?.id;
}

export function getLanguageName(languageId) {
  return (
    Object.values(LANGUAGES).find((lang) => lang.id === languageId)?.name ||
    "Unknown"
  );
}

export function isSupportedLanguageId(languageId) {
  return Object.values(LANGUAGES).some((lang) => lang.id === languageId);
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility: split into chunks of max 20 for Judge0 batch
export function chunkArray(arr, size = 20) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Submit batch of submissions to Judge0.
export async function submitBatch(submissions) {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions },
    // Judge0 answers 422 when every submission in the batch is invalid. Let it
    // through so the body below explains *why* instead of surfacing a bare
    // "Request failed with status code 422".
    { validateStatus: (status) => status === 422 || (status >= 200 && status < 300) }
  );

  // Judge0 reports per-submission errors *inline* with the tokens, e.g.
  //   [{ language_id: ["language with id 9999 doesn't exist"] }, { token: "..." }]
  // Mapping straight to .token would yield an undefined entry, and the results
  // coming back would silently misalign with the test cases they belong to.
  const rejected = Array.isArray(data)
    ? data.find((entry) => !entry?.token)
    : data;
  if (rejected) {
    throw new Error(`Judge0 rejected a submission: ${JSON.stringify(rejected)}`);
  }

  return data;
}

// Judge0 has no push API on the batch endpoint, so we poll. Bounded so a dead
// or wedged Judge0 fails the request instead of pinning a server function open
// forever.
// ponytail: polling; switch to callback_url + a webhook route if execution
// latency or function billing becomes a problem.
const POLL_TIMEOUT_MS = 60_000;
const POLL_START_MS = 150;
const POLL_MAX_MS = 1000;

export async function pollBatchResults(tokens) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  // Typical runs finish in well under a second, so start tight and back off
  // instead of paying a flat 1s of dead latency on every single execution.
  let interval = POLL_START_MS;

  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
          fields: "*", // ensure full fields (stdout, status, time, memory, etc.) come back
        },
      }
    );

    const results = data.submissions;

    const isAllDone = results.every(
      (result) => result.status.id !== 1 && result.status.id !== 2
    );

    if (isAllDone) {
      return results;
    }

    if (Date.now() >= deadline) {
      throw new Error(`Judge0 did not finish within ${POLL_TIMEOUT_MS / 1000}s`);
    }

    await sleep(interval);
    interval = Math.min(interval * 1.5, POLL_MAX_MS);
  }
}
