import CreateProblemForm from '@/modules/problems/components/create-problem-form';
import { getPatternOptions } from '@/modules/patterns/actions';
import PageShell from '@/components/page-shell';
import React from 'react'

/**
 * Lives inside the (root) group so it inherits the navbar and the shared page
 * shell. It used to sit at the top level with no navigation of its own beyond a
 * lone back arrow, its own duplicate theme toggle, and an amber heading that
 * matched nothing else in the app.
 */
const CreateProblemPage = async () => {
  const { data: patterns } = await getPatternOptions();

  return (
    <PageShell>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          New problem
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Added to the catalogue as soon as it is saved, and numbered
          automatically.
        </p>
      </div>
      <CreateProblemForm patterns={patterns ?? []} />
    </PageShell>
  )
}

export default CreateProblemPage
