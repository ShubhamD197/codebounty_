Last updated: 2026-08-15. Update this file whenever a new page, component, or major state change is added to the project, before generating any new Stitch designs.

# 1. PROJECT OVERVIEW
CodeBounty is a pattern-first DSA (Data Structures and Algorithms) practice platform that emphasizes interactive, user-hosted coding sessions. It extends the standard solitary coding practice (like LeetCode) by enabling community-driven practice sessions while maintaining a simple user identity model (Clerk).

**User Roles & Capabilities:**
*   **Learner (`USER`):** The primary role. Can browse algorithms, practice problems in a multi-language editor, submit solutions (evaluated by Judge0), track statistics (solved problems, recent activity), and join/participate in coding sessions.
*   **Session Host (`USER` acting as host):** Any regular user can create and host a session. They define the session scope (problems, duration) and manage the collaborative practice experience. (No special "teacher" role required).
*   **Admin (`ADMIN`):** Manages the platform's core content. Can access the admin dashboard, create/edit global problems, manage test cases (which are rigorously validated via Judge0 before saving), and oversee platform data.

# 2. ROUTE/PAGE INVENTORY

| Path | Purpose | Access | Data / Actions |
| :--- | :--- | :--- | :--- |
| `/` (Landing) | Platform entry point, hero section, feature highlights. | Public | Static marketing content. CTA to login/sign up. |
| `/problems` | Main problem catalog. Lists all available DSA problems. | Public (view), User (interact) | Fetches `Problem` list. Actions: Filter/search problems, click to practice. |
| `/problem/[id]` | The core coding workspace. Displays problem description and the Monaco editor. | User | Fetches `Problem` (with visible test cases), user's previous submissions. Actions: Run Code, Submit Code, View test results. |
| `/profile` | User dashboard showing statistics and activity history. | User | Fetches user stats (total solved, recent submissions, streak). Actions: View history, navigate to solved problems. |
| `/admin` | Admin control panel. Lists problems for management. | Admin | Fetches all `Problem` records. Actions: Create new problem, Edit problem, Delete problem. |
| `/admin/problems/create` | Complex form to draft new problems and validate test cases. | Admin | Form state (title, description, test cases). Actions: Add/remove test cases, Validate against Judge0, Save problem. |
| `/api/webhooks/clerk` | Handles Clerk authentication webhooks (user creation/updates). | System | Syncs Clerk user data with local database. |
| `/api/create-problem` | Backend endpoint for creating a problem. Validates test cases via Judge0 batch API before DB insertion. | Admin | Receives problem data. Actions: Judge0 validation, DB transaction. |

*(Note: Session-specific routes are planned but not fully implemented in the current baseline).*

# 3. COMPONENT INVENTORY

| Component | File Path | Usage | Notes |
| :--- | :--- | :--- | :--- |
| `Navbar` | `components/layout/navbar.jsx` | Global Layout | Main navigation, Auth buttons (Clerk). |
| `Footer` | `components/layout/footer.jsx` | Global Layout | Standard footer links. |
| `CodeEditor` | `modules/problems/components/code-editor.jsx` | `/problem/[id]` | Wraps Monaco editor. Handles language selection & code input. |
| `ProblemDescription` | `modules/problems/components/problem-description.jsx` | `/problem/[id]` | Renders problem markdown and difficulty badges. |
| `TestCasePanel` | `modules/problems/components/test-case-panel.jsx` | `/problem/[id]` | Displays input/output for visible test cases and execution results. |
| `ProblemList` | `modules/problems/components/problem-list.jsx` | `/problems` | Table/Grid of problems with status icons. |
| `CreateProblemForm` | `modules/problems/components/create-problem-form.jsx` | `/admin/problems/create` | Massive (971 line) complex form for admin problem creation. |
| `DifficultyBadge` | *Inline/Duplicated* | Multiple pages | Renders Easy/Medium/Hard tags. **Needs extraction.** |
| `StatCard` | `modules/profile/components/stat-card.jsx` | `/profile` | Displays aggregate metrics (e.g., Total Solved). |

# 4. NAVIGATION MAP

**Learner Flow:**
1.  Landing Page (`/`) -> Click "Start Practicing" -> Auth Gate -> Problems List (`/problems`).
2.  Problems List (`/problems`) -> Click a problem -> Problem Workspace (`/problem/[id]`).
3.  Problem Workspace (`/problem/[id]`) -> Write code -> Click "Run" -> View local results.
4.  Problem Workspace (`/problem/[id]`) -> Click "Submit" -> View final results -> (Success) -> Confetti/Status Update.
5.  Navbar -> Click Avatar -> Profile (`/profile`) -> Review past submissions.

**Admin Flow:**
1.  Navbar -> Click "Admin Dashboard" -> Admin Panel (`/admin`).
2.  Admin Panel (`/admin`) -> Click "Create Problem" -> Problem Form (`/admin/problems/create`).
3.  Problem Form (`/admin/problems/create`) -> Fill data -> Validate -> Save -> Redirect to Admin Panel (`/admin`).

# 5. STATE & DATA MODEL

**Core Entities (Prisma Schema):**
*   `User`: Local mirror of Clerk user (id, email, role: USER/ADMIN).
*   `Problem`: The core entity (title, description, difficulty, starter code snippets).
*   `TestCase`: Associated with a Problem. Flags for `isHidden` (used for submission vs run).
*   `Submission`: User's attempt (code, language, status: Accepted, Wrong Answer, etc., execution time).
*   `ProblemSolved`: Join table tracking which users have successfully solved which problems.
*   *(Planned)* `Session` & `SessionMember`: For the collaborative practice features.

**State Management:**
*   Largely relies on Next.js App Router server components for initial data fetching.
*   Client-side state (React `useState`/`useReducer`) heavily used in `CreateProblemForm` for complex test case management and in `/problem/[id]` for execution status.

# 6. EXTERNAL DEPENDENCIES / INTEGRATIONS

*   **Clerk:** Primary identity and authentication provider. Handles login UI and session management.
*   **Judge0:** Core execution engine.
    *   `/submissions` (Single): Used for basic runs.
    *   `/submissions/batch`: Used for complex admin validations and full submissions against hidden test cases.
*   **PostgreSQL (Neon):** Primary database, accessed via Prisma ORM.
*   **Monaco Editor:** The code editor instance used in the problem workspace.

# 7. REDUNDANCY & REFACTORING OPPORTUNITIES

1.  **Component Duplication (Difficulty Badges):** The logic and Tailwind classes for rendering "Easy" (green), "Medium" (yellow), "Hard" (red) badges are duplicated across `/problems`, `/problem/[id]`, and `/admin`. Needs a centralized `<DifficultyBadge />` component.
2.  **Date Formatting:** Consistent date formatting (e.g., "Solved 2 days ago") is manually re-implemented in the profile and submission history views. Needs a shared utility function.
3.  **CreateProblemForm Complexity:** `modules/problems/components/create-problem-form.jsx` is nearly 1,000 lines long. It handles UI, form state, complex array mutations for test cases, Monaco editor integration, and Judge0 API calls. It should be refactored into smaller sub-components (e.g., `TestCaseManager`, `EditorConfigurator`).
4.  **Layout Padding:** Inconsistent usage of top padding across main layout wrappers, causing slight UI jumps between the `/problems` listing and the `/profile` pages. Rely more on CSS variables and a standard `<PageContainer>` component.
