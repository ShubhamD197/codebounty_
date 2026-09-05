# CodeBounty Infrastructure & Production Roadmap

Companion to `PRD.md` (product scope) and `TUTORIAL_TO_PRODUCT_PLAN.md` (feature phases).
This document covers what those two do not: **stack decisions, deployment, code
execution infrastructure, security, performance, and cost.**

Last updated: 2026-09-04.

---

## 1. Stack Decision: Stay on Next.js

**Decision: keep the monolithic Next.js app. Do not split out a separate Node/Express backend.**

### Why

The usual reason to split a backend out of Next.js is long-running or CPU-bound
work that would tie up request handlers. **CodeBounty already offloads that to
Judge0.** The app's own work is: authenticate, read/write Postgres, call Judge0,
render. All of that is what Server Actions and Route Handlers are for.

Splitting would cost:

- A second deploy target and CI pipeline.
- Cross-origin Clerk token verification instead of `currentUser()` in-process.
- A duplicated Prisma client and a schema-sharing problem.
- A network hop on every query that is currently a function call.

...and buy nothing at the current or projected scale.

### The real problem behind the question

The architecture smell is not "Next.js vs Node." It is **synchronous polling**:

```js
// lib/judge0/judge0.js
export async function pollBatchResults(tokens) { /* poll every 1s until done */ }
```

Every Run/Submit holds a server function open for the full execution duration.
A separate Node server would not fix this — it would move a blocked thread from
one process to another. The fix is asynchronous execution (§3.3).

### When to revisit

Split out a service only if one of these becomes true:

- A websocket/realtime layer for live sessions outgrows serverless (Phase 4).
- Background jobs (scheduled contests, batch rejudging) need a real queue + worker.
- Judge0 orchestration grows into its own scheduling concern.

Even then, the answer is a **small dedicated worker service**, not migrating the
whole app off Next.js.

---

## 2. Deployment Topology

| Component | Where | Why |
| :--- | :--- | :--- |
| Next.js app | Vercel | Zero-config for Next 16, preview deploys, generous free tier. |
| Postgres | **Neon** *(already in use)* | Serverless-friendly pooling; Vercel functions exhaust classic connection limits. |
| Judge0 | See §3 | **Cannot** run on Vercel/Fly/Railway/Render. |
| Auth | Clerk (already) | Free to 10k MAU. |
| AI hints | Gemini API (Phase 3) | Free tier sufficient for demo volume. |

> **Two connection strings, and they are not interchangeable.** `DATABASE_URL`
> uses Neon's pooled endpoint — required, because each serverless function opens
> its own Prisma connection and would otherwise exhaust Postgres. But the migrate
> engine **cannot** run through pgBouncer; against the pooled host it fails with
> a misleading `P1001: Can't reach database server`. `DIRECT_URL` therefore holds
> the same URL with `-pooler` stripped from the hostname, and `prisma.config.ts`
> prefers it. The runtime app keeps using the pooled URL.
>
> `docker-compose.yml` is dev-only leftover and is not part of any environment.

**If a migration hangs on `Timed out trying to acquire a postgres advisory lock`:**
a previous migrate run went through the pooler, took Prisma's migration lock,
and failed — pgBouncer then kept that backend alive, so the lock was never
released and every later run queues behind a dead process. Find and clear it:

```sql
SELECT l.pid, a.state FROM pg_locks l
  JOIN pg_stat_activity a ON a.pid = l.pid
 WHERE l.locktype = 'advisory';
-- if the holder is idle and holds only objid 72707369:
SELECT pg_terminate_backend(<pid>);
```

Then re-run the migration against `DIRECT_URL`. Never point a migrate command at
the pooled host.

---

## 3. Judge0 in Production

### 3.1 The hard constraint

Judge0 executes untrusted code inside `isolate`, which requires **privileged
containers and direct cgroup access**. This means:

- Vercel, Fly.io, Railway, Render, Heroku, Cloud Run — all cannot run it.
- Any provider that gives you a real VM with root can: Hetzner, DigitalOcean,
  Contabo, Linode, AWS EC2, Oracle Cloud free tier.

The current VirtualBox VM works for development only — it is not publicly
routable and has no uptime guarantee.

### 3.2 Options

| Option | Cost | Ops burden | Good for |
| :--- | :--- | :--- | :--- |
| **Judge0 on RapidAPI** | Free ~50 req/day; paid from ~$10/mo | None | Launch, demo, resume review |
| **Self-host on a VPS** | Hetzner CX22 ~4 EUR/mo (2 vCPU / 4GB) | You own patching, monitoring, restarts | Sustained volume, cost control |
| Oracle Cloud always-free ARM | 0 | High (ARM images, capacity availability) | Hobby, if you tolerate the setup |

**Recommended path:** launch on RapidAPI, migrate to a self-hosted VPS once
request volume makes the API cost exceed roughly 5 EUR/mo.

`lib/judge0/judge0.js` already isolates every call behind `JUDGE0_API_URL`, so
the swap is a config change plus auth headers. Keep it that way — never call
Judge0 from outside that module.

### 3.3 Making execution asynchronous

Target architecture, once the app is live:

1. Submit to Judge0 with `callback_url` pointing at `/api/judge0/callback`.
2. Return immediately with a submission id; persist status `PENDING`.
3. Judge0 `PUT`s each finished submission to the callback route.
4. Push the result to the browser over SSE (or let the client poll our own DB,
   which is cheap — unlike holding a function open).

Benefits: no function-timeout ceiling, no wall-clock billing during execution,
survives a slow or queued Judge0.

Prerequisites: the app must be publicly reachable from the Judge0 host, and the
callback route must verify a shared secret — Judge0 callbacks are unauthenticated
by default, so treat that endpoint as hostile input.

**Interim mitigation (done):** both poll loops are bounded by a 60s deadline, so a
wedged Judge0 fails the request instead of hanging a function forever.

### 3.4 Securing a self-hosted Judge0 — non-negotiable

An internet-facing Judge0 with no auth is a **free arbitrary-code-execution
endpoint**. Scanners find these within hours and turn them into crypto miners.

Required before exposing any self-hosted instance:

- [ ] Set `AUTHN_HEADER` + `AUTHN_TOKEN` and `AUTHZ_HEADER` + `AUTHZ_TOKEN` in Judge0's config, and send them from `lib/judge0/judge0.js`.
- [ ] Firewall: allow inbound only from the app's egress IPs. Deny the world by default.
- [ ] Set `MAX_QUEUE_SIZE`, `MAX_CPU_TIME_LIMIT`, `MAX_MEMORY_LIMIT`, and disable network access for submissions.
- [ ] Run behind a reverse proxy with TLS and rate limiting.
- [ ] Cap workers to the VM's core count; monitor for runaway memory.

---

## 4. Performance & Correctness Backlog

Ranked by impact. Items marked done are complete.

### Severity: high (data integrity)

- **[done]** `getProblemById` leaked `referenceSolutions` and hidden `testCases` to the browser. `/problem/[id]` is a client component, so every field selected was readable in DevTools — the official solution and every hidden test. Now selects public fields only.
- **[done]** `getAllProblems` returned full rows (description, testCases, codeSnippets, referenceSolutions) for every problem, on a list view that renders four fields. Now a narrow `select`.
- [ ] **One secret is committed:** `mcp.json` contains a Google/Stitch API key and is tracked (first committed in `d7af845`). Rotate that key and untrack the file.
  - `.env` is **not** committed — `.gitignore` covers `.env*` and git history confirms it was never added. The Clerk secret key and both Neon URLs live only on disk. Still add them to Vercel's environment config before deploying, but there is no exposure to remediate.
  - `docker-compose.yml` has a hardcoded Postgres password, but that stack is unused dev leftover. Low priority; delete the file instead.

### Severity: medium

- **[done]** Duplicated `db.user.findUnique({clerkId})` on nearly every action, replaced by `getDbUser()` in `lib/auth.js` wrapped in React `cache()` — one query per request.
- **[done]** Unbounded `while(true)` poll loops now have a 60s deadline.
- **[done]** Missing indexes on `Submission(userId, problemId)`, `Submission(problemId)`, `ProblemSolved(problemId)`. Migration `20260904180354_add_submission_indexes` applied to Neon.
- [ ] **No pagination** on `/problems`. Fine at 20 problems, not at 500.
- [ ] **`/profile` loads every submission ever** via `include: { submissions: true }`. Needs `take` plus pagination.
- [ ] `@@index([status])` on `Submission` is near-useless (two distinct values). Drop it.
- [ ] Everything is `force-dynamic`. The problem list and problem detail are cacheable per user; add `revalidateTag` on problem mutations.

### Severity: low

- [ ] `console.log(JSON.stringify(result, null, 2))` of full Judge0 payloads in `app/api/create-problem/route.js` — noisy, and it leaks solution output into logs.
- [ ] `getJudge0LanguageId` supports 5 languages; `getLanguageName` maps 4 different ones. Reconcile into one table.
- [ ] `backupfiles/` should not be in the repo.

---

## 5. Security Checklist Before Going Live

- [ ] Rotate the Google/Stitch API key in `mcp.json` and untrack the file (it is the only committed secret).
- [ ] Move `.env` values into Vercel environment variables for deployment (`.env` itself is correctly gitignored).
- [ ] Judge0 auth tokens plus IP allowlist (§3.4).
- [ ] Rate-limit `runCode` / `submitCode` per user — a signed-in user can currently hammer Judge0 without limit.
- [ ] Rate-limit AI hints per user (already in PRD §11.5).
- [ ] Validate Server Action inputs with Zod. `runCode(sourceCode, languageId, problemId)` trusts all three today, and `languageId` goes straight to Judge0.
- [ ] Confirm hidden test cases are never returned by any action or route.
- [ ] Add a `SECURITY.md` and dependency scanning.

---

## 6. Immediate Next Actions

1. Rotate the Google/Stitch API key in `mcp.json`; untrack the file.
2. Add pagination to `/problems` and `/profile`.
3. Then resume feature work at **Phase 2 (Pattern system)** per
   `TUTORIAL_TO_PRODUCT_PLAN.md` — it is the product differentiator, and
   everything in Phase 5 (analytics) depends on it.

---

## 7. Cost Projection

| Stage | Monthly |
| :--- | :--- |
| Demo / portfolio (free tiers, Judge0 on RapidAPI free) | **0** |
| Small real usage (Neon free, Judge0 VPS on Hetzner) | **~5 EUR** |
| Growing (Neon paid, larger VPS, Clerk still free under 10k MAU) | **~35 EUR** |
