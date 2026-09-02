# CodeBounty Design Brief

## 1. AESTHETIC DIRECTION
*   **Theme:** Dark-first, layered near-black backgrounds (not pure black, not flat).
*   **Accent Color:** Deep violet/indigo (never LeetCode-style orange/yellow).
*   **Typography:** Inter for UI, JetBrains Mono (or Geist Mono) for code/editor. Never use system default fonts.
*   **Density Strategy:** "Structured density" — generous 24-32px breathing room around primary actions (editor, main CTAs), tighter 8-12px density in data-heavy areas (test case tables, submission history, admin lists). NOT uniformly sparse, NOT cluttered like LeetCode.
*   **Premium Feel:** Soft single-layer shadows, 1px low-opacity borders (not hard dividers), 150-200ms ease transitions on all interactive elements. Color used sparingly (grayscale UI + accent only for one primary action + semantic status colors).

## 2. DESIGN TOKEN SYSTEM
**Colors:**
*   **Backgrounds:** `bg-base`: #0A0A0B, `bg-surface`: #131316, `bg-elevated`: #1C1C21
*   **Borders:** `border`: #2A2A30
*   **Text:** `text-primary`: #F5F5F7, `text-secondary`: #A1A1AA, `text-muted`: #71717A
*   **Accent:** `accent`: #8B5CF6 (primary purple)
*   **Hover/Active:** `accent-hover`: #A78BFA, `accent-active`: #7C3AED
*   **Gradients:** `accent-gradient-end`: #6D28D9 (use for subtle glow/gradient effects on primary CTAs and hero sections only — not flat fills everywhere)
*   **Semantic:** `success/pass`: #22C55E, `error/fail`: #EF4444, `pending/running`: #F59E0B

**Typography Scale:**
*   `text-xs` (12px), `text-sm` (14px, default body), `text-base` (16px), `text-lg/xl` (headings), `text-2xl/3xl` (page titles)
*   Code editor fixed at 14px monospace.

**Spacing Scale (4px base):**
*   4, 8, 12, 16, 24, 32, 48, 64

**Border Radius:**
*   6px inputs/small elements
*   10px cards/buttons
*   16px modals
*   Full pill for status badges

**Component States:**
*   **Hover:** Slight bg lighten only, no layout shift.
*   **Active:** 98% scale.
*   **Disabled:** 40% opacity.
*   **Loading/Running:** Accent-colored pulsing dot + skeleton shimmer (NOT a generic spinner — represents Judge0 execution state, feels alive).

## 3. PAGE REDESIGN PRIORITY ORDER
1.  **`/` (Landing)** - Highest demo impact (Hero, feature highlights).
2.  **`/problems`** - Core catalog experience.
3.  **`/problem/[id]`** - The centerpiece coding workspace.
4.  **`/profile`** - Submissions dashboard and stats.
5.  **`/admin` & `/admin/problems/create`** - Admin tools (complex, data-heavy forms).

## 4. PER-PAGE BRIEF (Structured Density Application)

*   **`/` (Landing):** Generous 48-64px spacing between marketing sections to establish a premium feel. The primary "Start Practicing" CTA gets 32px breathing room and an `accent-gradient-end` glow. Feature highlights (cards) use 24px inner padding.
*   **`/problems`:** The main `ProblemList` grid/table requires tight 8-12px vertical spacing to comfortably scan the algorithm catalog. However, the top search/filter bar and header require generous 24-32px margins to cleanly separate navigation controls from the dense data list.
*   **`/problem/[id]`:** The centerpiece. The `CodeEditor` and main action buttons (Run/Submit) require 24px breathing room so the user isn't overwhelmed. Conversely, the `TestCasePanel` (showing inputs/outputs) and the `ProblemDescription` (markdown constraints) use tighter 12-16px density to fit dense technical information on screen without excessive scrolling.
*   **`/profile`:** `StatCard`s (Total Solved, Streak) at the top use 24px layout spacing to highlight achievements. The recent activity/submission history list below demands tighter 8-12px row spacing, allowing users to scan multiple past runs quickly.
*   **`/admin` & `/admin/problems/create`:** Highly dense utility pages. The `CreateProblemForm` (managing multiple test case inputs and expected outputs) needs minimal 8-12px padding between form fields to maximize vertical screen real estate, keeping the complex editor preview and validation results visible simultaneously. The main "Save Problem" CTA at the bottom retains 24px isolation to prevent accidental clicks.

## 5. CONSISTENCY RULES FOR STITCH

*(Prepend this block to every future Stitch prompt)*

> **STITCH INSTRUCTIONS:**
> Use exactly this token system:
> *   **Colors:** bg-base: #0A0A0B, bg-surface: #131316, bg-elevated: #1C1C21, border: #2A2A30, text-primary: #F5F5F7, text-secondary: #A1A1AA, text-muted: #71717A, accent: #8B5CF6, accent-hover: #A78BFA, accent-active: #7C3AED, accent-gradient-end: #6D28D9 (glow/CTA only), success/pass: #22C55E, error/fail: #EF4444, pending/running: #F59E0B.
> *   **Typography:** Inter (UI), JetBrains Mono or Geist Mono (Code/Editor). Sizes: 12px, 14px (body), 16px, 18/20px, 24/30px.
> *   **Spacing/Radius:** 4, 8, 12, 16, 24, 32, 48, 64px scale. 6px (inputs), 10px (cards/btns), 16px (modals), pill (badges).
> *   **States:** Hover = slight bg lighten, Active = 98% scale, Disabled = 40% opacity, Loading = accent pulsing dot + shimmer (no generic spinners).
> Never introduce new colors, fonts, or spacing values outside this system.
> Reuse these existing components conceptually: `Navbar`, `Footer`, `CodeEditor`, `ProblemDescription`, `TestCasePanel`, `ProblemList`, `CreateProblemForm`, `DifficultyBadge`, `StatCard`.
> Maintain structured density: generous space (24-32px+) on primary actions/editors, tight space (8-12px) on data tables/lists and form fields.
