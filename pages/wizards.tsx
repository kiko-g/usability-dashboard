import React from 'react';
import { Layout } from '../components/layout';
import { IWizardGroup } from '../@types';

const mockData: IWizardGroup[] = [
  {
    name: 'Create New Augmented Reality Tag',
    avgScore: 100,
    avgTimespan: 113.955,
    completed: 2,
    notCompleted: 1,
    completedRatio: 0.6666666666666666,
    total: 3,
    wizards: [
      {
        component: 'wizard-168357091638068',
        name: 'Create New Augmented Reality Tag',
        events: [
          {
            time: '2023-05-08T18:35:16.414Z',
            path: '/Administration/AugmentedReality',
            action: 'Start',
          },
          {
            time: '2023-05-08T18:35:16.580Z',
            path: '/Administration/AugmentedReality',
            action: 'Activate Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-08T18:35:54.658Z',
            path: '/Administration/AugmentedReality',
            action: 'Success Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-08T18:35:54.851Z',
            path: '/Administration/AugmentedReality',
            action: 'Complete',
          },
        ],
        score: 100,
        timespan: 38.437,
        completed: true,
        errorCount: 0,
        backStepCount: 0,
      },
      {
        component: 'wizard-168373558363277',
        name: 'Create New Augmented Reality Tag',
        events: [
          {
            time: '2023-05-10T16:19:43.643Z',
            path: '/Administration/AugmentedReality',
            action: 'Start',
          },
          {
            time: '2023-05-10T16:19:43.784Z',
            path: '/Administration/AugmentedReality',
            action: 'Activate Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-10T16:21:13.642Z',
            path: '/Administration/AugmentedReality',
            action: 'Success Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-10T16:21:13.746Z',
            path: '/Administration/AugmentedReality',
            action: 'Complete',
          },
        ],
        score: 100,
        timespan: 90.103,
        completed: true,
        errorCount: 0,
        backStepCount: 0,
      },
      {
        component: 'wizard-1683735958646106',
        name: 'Create New Augmented Reality Tag',
        events: [
          {
            time: '2023-05-10T16:25:58.657Z',
            path: '/Administration/AugmentedReality',
            action: 'Start',
          },
          {
            time: '2023-05-10T16:25:58.789Z',
            path: '/Administration/AugmentedReality',
            action: 'Activate Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-10T16:29:31.982Z',
            path: '/Administration/AugmentedReality',
            action: 'Cancel',
          },
        ],
        score: 100,
        timespan: 213.325,
        completed: false,
        errorCount: 0,
        backStepCount: 0,
      },
    ],
  },
];

export default function Visits() {
  const [data, setData] = React.useState<IWizardGroup[]>([]);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetch('/api/matomo/events/wizard')
      .then((res) => res.json())
      .then((data: IWizardGroup[]) => {
        setLoading(false);
        setData(data);
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      });
  }, []);

  return (
    <Layout location="Wizards">
      <main className="space-y-6">
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Wizard Insights</h1>
          <p className="max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the wizard components across MES.
          </p>
          <div className="mt-3 flex gap-6">
            <WizardCompletionRateCard />
            <WizardAverageUXScoreCard />
          </div>
        </article>
      </main>
    </Layout>
  );
}

function WizardCompletionRateCard() {
  const rate = 0.9;
  const progress = Math.min(Math.max(rate, 0), 1) * 100;
  const diameter = 200;
  const strokeWidth = 12;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative max-w-xs overflow-hidden rounded bg-white/80 p-4 dark:bg-white/10">
      <h3 className="font-medium text-slate-700 dark:text-slate-100">Wizard Completion Rate</h3>
      <p className="mt-1 min-h-[6rem] text-sm tracking-tight">
        Ratio of wizards that were submitted successfully vs. all the wizards started in the platform
      </p>

      {/* Circular Progress */}
      <div className="mt-4 flex items-center justify-center p-4">
        <svg className="w-50 h-50" viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
          <circle
            fill="none"
            stroke="currentColor"
            className="text-green-500 opacity-20"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
          />
          <circle
            fill="none"
            className="origin-center -rotate-90 transform stroke-current text-green-500"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
            strokeDashoffset={offset}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute flex w-full flex-col text-center">
          <span className="text-4xl font-bold">{`${Math.round(progress)}%`}</span>
          <span className="text-xl">232/386</span>
        </div>
      </div>
    </div>
  );
}

function WizardAverageUXScoreCard() {
  const avgScore = 90;
  const diameter = 200;
  const strokeWidth = 12;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (avgScore / 100) * circumference;

  return (
    <div className="relative max-w-xs rounded bg-white/80 p-4 dark:bg-white/10">
      <h3 className="font-medium text-slate-700 dark:text-slate-100">Wizard Average UX Score</h3>
      <p className="mt-1 min-h-[6rem] text-sm tracking-tight">
        Ratio of wizards that were submitted successfully vs. all the wizards started in the platform. Score is
        calculated based on <span className="underline">this approach</span>.
      </p>

      {/* Circular Progress */}
      <div className="mt-4 flex items-center justify-center p-4">
        <svg className="w-50 h-50" viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
          <circle
            fill="none"
            stroke="currentColor"
            className="text-cyan-400 opacity-20"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
          />
          <circle
            fill="none"
            className="origin-center -rotate-90 transform stroke-current text-cyan-400"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
            strokeDashoffset={offset}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute flex w-full flex-col text-center">
          <span className="text-4xl font-bold">{avgScore}</span>
          <span className="text-xl">out of 100</span>
        </div>
      </div>
    </div>
  );
}
