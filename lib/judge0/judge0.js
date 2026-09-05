import axios from "axios";

export function getJudge0LanguageId(language) {
  const languageMap = {
    "PYTHON": 71,
    "JAVASCRIPT": 63,
    "JAVA": 62,
    "CPP": 54,
    "GO": 60,
  };
  return languageMap[language.toUpperCase()];
}

export function getLanguageName(languageId) {
  const LANGUAGE_NAMES = {
    74: "TypeScript",
    63: "JavaScript",
    71: "Python",
    62: "Java",
  };
  return LANGUAGE_NAMES[languageId] || "Unknown";
}


export async function getJudge0Result(token) {
  let result;
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (true) {
    const response = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/${token}`);
    result = response.data;
    if (result.status.id !== 1 && result.status.id !== 2) break;
    if (Date.now() >= deadline) {
      throw new Error(
        `Judge0 did not finish within ${POLL_TIMEOUT_MS / 1000}s`
      );
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return result;
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

// Submit batch of submissions to Judge0
export async function submitBatch(submissions) {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions }
  );
  console.log('Batch submission response:', data);
  return data;
}

// Poll all tokens until they are done
// export async function pollBatchResults(tokens) {
//   while (true) {
//     const { data } = await axios.get(
//       `${process.env.JUDGE0_API_URL}/submissions/batch`,
//       {
//         params: {
//           tokens: tokens.join(","),
//           base64_encoded: false,
//         }
//       }
//     );

//     console.log(data);
//     const results = data.submissions;

//     const isAllDone = results.every(
//       (r) => r.status.id !== 1 && r.status.id !== 2
//     );
//     if (isAllDone) return results;

//     await sleep(1000);
//   }
// }

// Judge0 has no push API on the batch endpoint, so we poll. Bounded so a dead
// or wedged Judge0 fails the request instead of pinning a server function open
// forever.
// ponytail: fixed 1s interval; switch to callback_url + a webhook route if
// execution latency or function billing becomes a problem.
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 60_000;

export async function pollBatchResults(tokens) {
  let results;
  const deadline = Date.now() + POLL_TIMEOUT_MS;

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

    results = data.submissions;

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2
    );

    if (isAllDone) {
      return results;
    }

    if (Date.now() >= deadline) {
      throw new Error(
        `Judge0 did not finish within ${POLL_TIMEOUT_MS / 1000}s`
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }
}