import { redirect } from "next/navigation";
import { getProfileData } from "@/modules/profile/actions";
import { tallyByPattern } from "@/modules/patterns/progress";
import ProfileIdentity from "@/modules/profile/components/profile-identity";
import LanguageStats from "@/modules/profile/components/language-stats";
import PatternSkills from "@/modules/profile/components/pattern-skills";
import SolvedSummary from "@/modules/profile/components/solved-summary";
import ActivityHeatmap from "@/modules/profile/components/activity-heatmap";
import ProfileActivity from "@/modules/profile/components/profile-activity";
import PageShell from "@/components/page-shell";

export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  const profile = await getProfileData();

  if (!profile) redirect("/");

  const { user, totals, patterns } = profile;

  const solvedByDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
  user.solvedProblems.forEach((solved) => {
    if (solved.problem) solvedByDifficulty[solved.problem.difficulty] += 1;
  });

  const acceptedCount = user.submissions.filter((s) => s.status === "Accepted").length;
  const acceptanceRate =
    user.submissions.length > 0
      ? Math.round((acceptedCount / user.submissions.length) * 100)
      : 0;

  return (
    <PageShell>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* The rail sticks so progress stays in view while the activity scrolls. */}
        <aside className="w-full lg:w-72 lg:flex-shrink-0 space-y-4 lg:sticky lg:top-32 lg:self-start">
          <ProfileIdentity user={user} />

          <div className="rounded-xl border border-border bg-bg-surface p-5 grid grid-cols-2 gap-4">
            <Stat label="Submissions" value={user.submissions.length} />
            <Stat label="Acceptance" value={`${acceptanceRate}%`} />
            <Stat label="Solved" value={user.solvedProblems.length} />
            <Stat label="Playlists" value={user.playlists.length} />
          </div>

          <LanguageStats submissions={user.submissions} />
          <PatternSkills
            patterns={patterns}
            solvedByPattern={tallyByPattern(user.solvedProblems)}
          />
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          <SolvedSummary solvedByDifficulty={solvedByDifficulty} totals={totals} />

          <section className="rounded-xl border border-border bg-bg-surface p-6">
            <ActivityHeatmap submissions={user.submissions} />
          </section>

          <ProfileActivity
            solvedProblems={user.solvedProblems}
            submissions={user.submissions}
            playlists={user.playlists}
          />
        </main>
      </div>
    </PageShell>
  );
};

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

export default ProfilePage;
