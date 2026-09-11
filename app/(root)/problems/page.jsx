import { db } from '@/lib/db';
import { getAllProblems } from '@/modules/problems/actions';
import { getSavedProblemIds } from '@/modules/playlists/actions';
import ProblemsTable from '@/modules/problems/components/problem-table';
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import PageShell from '@/components/page-shell'

// Reads the Clerk session, so it can never be prerendered. Saying so keeps
// the build log free of DYNAMIC_SERVER_USAGE errors.
export const dynamic = "force-dynamic";

const ProblemsPage = async() => {
    const user = await currentUser()

    let dbUser = null;

    if(user){
         dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true }
    });
    }

    const [{ data: problems, error }, savedIds] = await Promise.all([
      getAllProblems(),
      getSavedProblemIds(),
    ]);

      if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading problems: {error}</p>
      </div>
    );
  }


  return (
    <PageShell>
      <ProblemsTable problems={problems} user={dbUser} savedIds={savedIds} />
    </PageShell>
  )
}

export default ProblemsPage