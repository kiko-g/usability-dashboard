import React from 'react';
import type { IWizardGroup } from '../@types';
import { mockWizardData } from '../utils/mock';
import { Layout } from '../components/layout';
import { Loading, NotFound } from '../components/utils';
import { ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/outline';

type CompletionRate = {
  completed: number;
  notCompleted: number;
  ratio: number;
};

export default function Wizards() {
  const [data, setData] = React.useState<IWizardGroup[]>([]);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  const avgScore = React.useMemo<number | null>(() => {
    if (data.length === 0) return null;

    const sum = data.reduce((acc, item) => acc + item.avgScore, 0);
    return data.length > 0 ? sum / data.length : 0;
  }, [data]);

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

  return (
    <Layout location="Wizards">
      <main className="space-y-6">
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Wizard Insights</h1>
          <p className="mb-2 max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the wizard components across MES.
          </p>

          {loading ? (
            <div className="space-y-3">
              <Loading />
            </div>
          ) : error ? (
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
          ) : (
            <div className="mt-3 flex gap-6">
              {completionRate === null ? null : <WizardCompletionRateCard completion={completionRate} />}
              {avgScore === null ? null : <WizardAverageUXScoreCard score={avgScore} />}
            </div>
          )}
        </article>
      </main>
    </Layout>
  );
}

function WizardCompletionRateCard({ completion }: { completion: CompletionRate }) {
  const progress = Math.min(Math.max(completion.ratio, 0), 1) * 100;
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
  const diameter = 200;
  const strokeWidth = 12;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

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
          <span className="text-4xl font-bold">{score.toFixed(1)}</span>
          <span className="text-xl">out of 100</span>
        </div>
      </div>
    </div>
  );
}
