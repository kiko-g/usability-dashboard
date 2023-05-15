import React from 'react';
import type { IWizardGroup } from '../@types';
import { mockWizardData } from '../utils/mock';
import { Layout } from '../components/layout';
import { Loading, NotFound } from '../components/utils';
import { ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/outline';

export default function Wizards() {
  return (
    <Layout location="Wizards">
      <main className="space-y-6">
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Wizard Insights</h1>
          <p className="mb-2 max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the wizard components across MES.
          </p>
          <WizardKPIs />
        </article>
      </main>
    </Layout>
  );
}

function WizardKPIs() {
  const [data, setData] = React.useState<IWizardGroup[]>([]);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  // fetch data from API
  React.useEffect(() => {
    if (!willFetch) return;

    fetch('/api/matomo/events/wizard')
      .then((res) => {
        if (!res.ok) {
          setError(true);
          setLoading(false);
          setWillFetch(false);
          return null;
        } else {
          return res.json();
        }
      })
      .then((data: IWizardGroup[]) => {
        setLoading(false);
        setWillFetch(false);
        setData(data === null ? [] : data);
      });
  }, [willFetch]);

  // calculate average score considering all wizards
  const avgScore = React.useMemo<number | null>(() => {
    if (data.length === 0) return null;

    const sum = data.reduce((acc, item) => acc + item.avgScore, 0);
    return data.length > 0 ? sum / data.length : 0;
  }, [data]);

  // calculate average completion rate considering all wizards
  const completionRate = React.useMemo<CompletionRate | null>(() => {
    if (data.length === 0) return null;

    const totalCompleted = data.reduce((acc, item) => acc + item.completed, 0);
    const totalNotCompleted = data.reduce((acc, item) => acc + item.notCompleted, 0);
    const total = totalCompleted + totalNotCompleted;

    return {
      completed: totalCompleted,
      notCompleted: totalNotCompleted,
      ratio: total > 0 ? totalCompleted / total : 0,
    };
  }, [data]);

  // calculate average, minimum and maximum time considering all wizards
  const wizardTimeStats = React.useMemo(() => {
    const totalTime = data.reduce((acc, item) => acc + item.avgTimespan * item.total, 0);
    const totalCount = data.reduce((acc, item) => acc + item.total, 0);

    const timespans = data.flatMap((item) => item.wizards.map((wizard) => wizard.timespan));
    const minTime = Math.min(...timespans);
    const maxTime = Math.max(...timespans);
    const averageTime = totalCount > 0 ? totalTime / totalCount : 0;

    return { avg: averageTime, min: minTime, max: maxTime };
  }, [data]);

  // calculate average, minimum and maximum step time considering all wizards
  const stepTimeStats = React.useMemo(() => {
    let totalStepTime = 0;
    let stepCount = 0;
    let minStepTime = 0;
    let maxStepTime = 0;

    data.forEach((item) => {
      item.wizards.forEach((wizard) => {
        for (let i = 0; i < wizard.events.length - 1; i++) {
          if (wizard.events[i].action === 'Activate' && wizard.events[i + 1].action === 'Success') {
            const stepTime =
              (new Date(wizard.events[i + 1].time).getTime() - new Date(wizard.events[i].time).getTime()) / 1000;
            totalStepTime += stepTime;
            stepCount++;

            minStepTime = Math.min(minStepTime, stepTime);
            maxStepTime = Math.max(maxStepTime, stepTime);
          }
        }
      });
    });

    const averageStepTime = stepCount > 0 ? totalStepTime / stepCount : 0;

    return { avg: averageStepTime, min: minStepTime, max: maxStepTime };
  }, [data]);

  // return early if loading
  if (loading)
    return (
      <div className="space-y-3">
        <Loading />
      </div>
    );

  // return early if error
  if (error)
    return (
      <div className="space-y-3">
        <NotFound />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setError(false);
              setData(mockWizardData);
            }}
            className="flex items-center gap-1 rounded bg-rose-600 px-3 py-2 text-white transition hover:opacity-80"
          >
            <CircleStackIcon className="h-5 w-5" />
            <span className="text-sm">Use mock Data</span>
          </button>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              setWillFetch(true);
            }}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-white transition hover:opacity-80"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span className="text-sm">Fetch again</span>
          </button>
        </div>
      </div>
    );

  return data.length === 0 ? null : (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {completionRate === null ? null : <WizardCompletionRateCard completion={completionRate} />}
        {avgScore === null ? null : <WizardAverageUXScoreCard score={avgScore} />}
      </div>
      <div className="flex items-center gap-4">
        <TimeStatsCard
          text="Wizard Time Stats"
          stats={{ avg: wizardTimeStats.avg, min: wizardTimeStats.min, max: wizardTimeStats.max }}
        />
        <TimeStatsCard
          text="Step Time Stats"
          stats={{ avg: stepTimeStats.avg, min: stepTimeStats.min, max: stepTimeStats.max }}
        />
      </div>
    </div>
  );
}

type CompletionRate = {
  completed: number;
  notCompleted: number;
  ratio: number;
};

function WizardCompletionRateCard({ completion }: { completion: CompletionRate }) {
  const progress = Math.min(Math.max(completion.ratio, 0), 1) * 100;
  const diameter = 120; // Adjusted diameter value
  const strokeWidth = 7; // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative max-w-xs overflow-hidden rounded bg-white/80 p-4 dark:bg-white/10">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-slate-700 dark:text-slate-100">Wizard Completion Rate</h3>
      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Ratio of wizards that were submitted successfully vs. all the wizards started in the platform
      </p>
      {/* Circular Progress */}
      <div className="mt-2 flex items-center justify-center p-4">
        <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
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
          <span className="text-4xl font-bold">{`${progress.toFixed(1)}%`}</span>
          <span className="text-xl">
            {completion.completed}/{completion.completed + completion.notCompleted}
          </span>
        </div>
      </div>
    </div>
  );
}

function WizardAverageUXScoreCard({ score }: { score: number }) {
  const diameter = 120; // Adjusted diameter value
  const strokeWidth = 7; // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative max-w-xs rounded bg-white/80 p-4 dark:bg-white/10">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-slate-700 dark:text-slate-100">Wizard Average UX Score</h3>
      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Ratio of wizards that were submitted successfully vs. all the wizards started in the platform. Score is
        calculated based on <span className="underline">this approach</span>.
      </p>
      {/* Circular Progress */}
      <div className="mt-2 flex items-center justify-center p-4">
        <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
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
          <span className="text-4xl font-bold">{score.toFixed(1)}</span>
          <span className="text-xl">out of 100</span>
        </div>
      </div>
    </div>
  );
}

const TimeStatsCard = ({ stats, text }: { text: string; stats: { avg: number; min: number; max: number } }) => {
  const { avg, min, max } = stats;

  return (
    <div className="relative max-w-sm rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-4 text-xl font-bold">{text}</h2>
      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-cyan-500" />
        <span className="font-semibold">
          Average: <span className="font-normal">{avg.toFixed(2)}s</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-pink-500" />
        <span className="font-semibold">
          Average: <span className="font-normal">{min.toFixed(2)}s</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-violet-500" />
        <span className="font-semibold">
          Maximum: <span className="font-normal">{max.toFixed(2)}s</span>
        </span>
      </div>
    </div>
  );
};
