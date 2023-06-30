import React from 'react';
import { Layout } from '@/components/layout';
import { ScoringApproach } from '@/@types';
import { WizardFormula } from '@/components/WizardFormula';
import { SelectFormula } from '@/components/SelectFormula';
import { ExecutionViewFormula } from '@/components/ExecutionViewFormula';
import { mockVisitsData, mockButtonData, mockWizardData, mockExecutionViewData, mockEventsData } from '@/utils/mock';
import { BeakerIcon, CodeBracketIcon, ScaleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { evaluateAndGroupExecutionViews, evaluateAndGroupWizards } from '@/utils/matomo';

export default function About() {
  const wizardScoringApproaches = ['A', 'B', 'C'] as ScoringApproach[];
  const [wizardScoringApproach, setWizardScoringApproach] = React.useState<ScoringApproach>('A');

  const executionViewScoringApproaches = ['A'] as ScoringApproach[];
  const [executionViewScoringApproach, setExecutionViewScoringApproach] = React.useState<ScoringApproach>('A');

  return (
    <Layout location="About">
      <article className="flex flex-col space-y-3">
        <div className="flex max-w-full flex-col justify-center gap-2">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">About</h2>

          <DataAccessTable wizardFormula={wizardScoringApproach} />

          {/* Wizards */}
          <div className="mb-3 flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xl font-bold tracking-tight sm:text-2xl">Wizard Scoring</h4>
              <SelectFormula
                scoringApproachHook={[wizardScoringApproach, setWizardScoringApproach]}
                scoringApproaches={wizardScoringApproaches}
              />
            </div>

            <div className="rounded border border-secondary/50 bg-white/80 px-6 py-4 pb-5 dark:bg-secondary/20">
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

            <div className="rounded border border-secondary/50 bg-white/80 px-6 py-4 pb-5 dark:bg-secondary/20">
              <ExecutionViewFormula formula={executionViewScoringApproach} />
            </div>
          </div>

          {/* Button */}
          <div className="mb-3 flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xl font-bold tracking-tight sm:text-2xl">Buttons</h4>
            </div>

            <div className="rounded border border-secondary/50 bg-white/80 px-4 py-4 dark:bg-secondary/20">
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

type DataAccessEntry = {
  name: string;
  api: string;
  apiScored: string | null;
  mock: any;
  mockScored: any;
};

function DataAccessTable({ wizardFormula }: { wizardFormula: ScoringApproach }) {
  const events = {
    name: 'Events',
    api: '/api/matomo/events',
    apiScored: null,
    mock: mockEventsData,
    mockScored: null,
  };

  const wizards = {
    name: 'Wizards',
    api: '/api/matomo/events/execution-view',
    apiScored: '/api/matomo/events/scored/execution-view',
    mock: mockWizardData,
    mockScored: evaluateAndGroupExecutionViews(mockExecutionViewData),
  };

  const executionsViews = {
    name: 'Execution Views',
    api: '/api/matomo/events/wizard',
    apiScored: '/api/matomo/events/scored/wizard',
    mock: mockWizardData,
    mockScored: evaluateAndGroupWizards(mockWizardData, wizardFormula),
  };

  const buttons = {
    name: 'Buttons',
    api: '/api/matomo/events/button',
    apiScored: null,
    mock: mockButtonData,
    mockScored: null,
  };

  const visits = {
    name: 'Visits',
    api: '/api/matomo/visits',
    apiScored: null,
    mock: mockVisitsData,
    mockScored: null,
  };

  const dataAccessEntries: DataAccessEntry[] = [events, wizards, executionsViews, buttons, visits];

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xl font-bold tracking-tight sm:text-2xl">Inspect Data</h4>
      </div>
      <ul className="mb-4 flex flex-col rounded border border-secondary/50 bg-white/80 p-4 dark:bg-secondary/20">
        {dataAccessEntries.map((item) => (
          <li key={`data-access-entry-${item.name}`} className="flex items-center space-x-2">
            <span className="w-40 whitespace-nowrap tracking-tight">{item.name}</span>
            <div className="flex items-center gap-2">
              <ApiRouteButton apiRoute={item.api} />
              <ApiRouteButtonScored apiRoute={item.apiScored} />
            </div>
            <div className="flex items-center gap-2">
              <RawJsonButton data={item.mock} />
              <ProcessedJsonData data={item.mockScored} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ApiRouteButton({ apiRoute }: { apiRoute: string }) {
  return (
    <Link target="_blank" title="Inspect API route source" href={apiRoute} className="hover:opacity-80">
      <CodeBracketIcon className="h-6 w-6" />
    </Link>
  );
}

function ApiRouteButtonScored({ apiRoute }: { apiRoute: string | null }) {
  if (apiRoute === null) return <span className="h-6 w-6" />;

  return (
    <Link target="_blank" title="Inspect API route source" href={apiRoute} className="hover:opacity-80">
      <BeakerIcon className="h-6 w-6" />
    </Link>
  );
}

function RawJsonButton({ data }: { data: any }) {
  return (
    <button
      title="View Raw JSON data"
      className="hover:opacity-80"
      onClick={() => {
        const jsonString = JSON.stringify(data);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
        window.open(dataUri, '_blank');
      }}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6">
        <path d="M5.759 3.975h1.783V5.76H5.759v4.458A1.783 1.783 0 0 1 3.975 12a1.783 1.783 0 0 1 1.784 1.783v4.459h1.783v1.783H5.759c-.954-.24-1.784-.803-1.784-1.783v-3.567a1.783 1.783 0 0 0-1.783-1.783H1.3v-1.783h.892a1.783 1.783 0 0 0 1.783-1.784V5.76A1.783 1.783 0 0 1 5.76 3.975m12.483 0a1.783 1.783 0 0 1 1.783 1.784v3.566a1.783 1.783 0 0 0 1.783 1.784h.892v1.783h-.892a1.783 1.783 0 0 0-1.783 1.783v3.567a1.783 1.783 0 0 1-1.783 1.783h-1.784v-1.783h1.784v-4.459A1.783 1.783 0 0 1 20.025 12a1.783 1.783 0 0 1-1.783-1.783V5.759h-1.784V3.975h1.784M12 14.675a.892.892 0 0 1 .892.892.892.892 0 0 1-.892.892.892.892 0 0 1-.891-.892.892.892 0 0 1 .891-.892m-3.566 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892m7.133 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892z"></path>
      </svg>
    </button>
  );
}

function ProcessedJsonData({ data }: { data: any }) {
  if (data === null) return <span className="h-6 w-6" />;

  return (
    <button
      title="View Scored JSON mock data"
      className="hover:opacity-80"
      onClick={() => {
        const jsonString = JSON.stringify(data);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
        window.open(dataUri, '_blank');
      }}
    >
      <ScaleIcon className="h-6 w-6" />
    </button>
  );
}
