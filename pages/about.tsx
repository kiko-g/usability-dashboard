import React from 'react';
import { Layout } from '@/components/layout';
import { ScoringApproach } from '@/@types';
import { WizardFormula } from '@/components/WizardFormula';
import { SelectFormula } from '@/components/SelectFormula';
import { ExecutionViewFormula } from '@/components/ExecutionViewFormula';

export default function About() {
  const wizardScoringApproaches = ['A', 'B'] as ScoringApproach[];
  const [wizardScoringApproach, setWizardScoringApproach] = React.useState<ScoringApproach>('A');

  const executionViewScoringApproaches = ['A', 'B'] as ScoringApproach[];
  const [executionViewScoringApproach, setExecutionViewScoringApproach] = React.useState<ScoringApproach>('A');

  return (
    <Layout location="About">
      <article className="flex flex-col space-y-3">
        <div className="flex max-w-full flex-col justify-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">About</h2>

          {/* Wizards */}
          <div className="mb-3 flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xl font-bold tracking-tight sm:text-2xl">Wizard Scoring</h4>
              <SelectFormula
                scoringApproachHook={[wizardScoringApproach, setWizardScoringApproach]}
                scoringApproaches={wizardScoringApproaches}
              />
            </div>

            <div className="rounded border border-secondary/50 bg-secondary/20 px-6 py-4 pb-5 dark:bg-secondary/20">
              <WizardFormula formula={wizardScoringApproach} />
            </div>
          </div>

          {/* Execution Views */}
          <div className="mb-3 flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xl font-bold tracking-tight sm:text-2xl">Execution Views Scoring</h4>
              <SelectFormula
                scoringApproachHook={[executionViewScoringApproach, setExecutionViewScoringApproach]}
                scoringApproaches={executionViewScoringApproaches}
              />
            </div>

            <div className="rounded border border-secondary/50 bg-secondary/20 px-6 py-4 pb-5 dark:bg-secondary/20">
              <ExecutionViewFormula formula={executionViewScoringApproach} />
            </div>
          </div>

          {/* Button */}
          <div className="mb-3 flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xl font-bold tracking-tight sm:text-2xl">Buttons</h4>
            </div>

            <div className="rounded border border-secondary/50 bg-secondary/20 px-4 py-4 dark:bg-secondary/20">
              <p className="text-sm">
                Buttons do not have a scoring formula as they are simply interacted with clicks. However, they can still
                be grouped by their type, time of clicks and percentage of relevance when compared to all the other
                buttons in the platform. This way we can identify which buttons are used the most and which ones are
                more stale.
              </p>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
