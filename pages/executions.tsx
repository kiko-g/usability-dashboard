import React, { Fragment } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import type { IExecutionViewGroup, ITrackerEventGroup, ScoringApproach } from '@/@types';

import { standardDeviation } from '@/utils';
import { ExecutionViewAction, evaluateAndGroupExecutionViews } from '@/utils/matomo';
import { mockExecutionViewData as mockData } from '@/utils/mock';

import { Layout } from '@/components/layout';
import { CircularProgressBadge, Loading, NotFound } from '@/components/utils';

import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import {
  ArrowPathIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  CircleStackIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  EllipsisHorizontalCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ScaleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { ExecutionViewErrorStatsType, ExecutionViewStats, ExecutionViewTabCompletionStats } from '@/@types/frontend';

export default function Executions() {
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  const [rawData, setRawData] = React.useState<ITrackerEventGroup[]>([]);
  const [processedData, setProcessedData] = React.useState<IExecutionViewGroup[]>([]);

  const scoringApproaches = ['A', 'B'];
  const [scoringApproach, setScoringApproach] = React.useState<ScoringApproach>('A');

  React.useEffect(() => {
    if (!willFetch) return;

    setError(false);
    setLoading(true);

    fetch('/api/matomo/events/execution-view')
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
      .then((data: ITrackerEventGroup[]) => {
        setLoading(false);
        setWillFetch(false);
        if (data === null) setProcessedData([]);
        else {
          setRawData(data);
          const processedExecutionViewData = evaluateAndGroupExecutionViews(data);
          setProcessedData(processedExecutionViewData);
        }
      });
  }, [willFetch]);

  return (
    <Layout location="Execution Views">
      <article className="flex flex-col justify-center gap-1">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Execution View Insights</h1>
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <p className="max-w-4xl grow text-lg font-normal">
            Inspect how your users are using the <span className="font-bold underline">execution views</span> to perform
            transactions across the platform.
          </p>

          {/* Header Buttons */}
          <div className="flex items-center gap-2">
            {/* Use mock data button */}
            {error === false ? null : (
              <button
                title="Use mock data"
                className="hover:opacity-80"
                onClick={() => {
                  setError(false);
                  setRawData(mockData);
                  const processedDataResult = evaluateAndGroupExecutionViews(mockData);
                  setProcessedData(processedDataResult);
                }}
              >
                <CircleStackIcon className="h-6 w-6" />
              </button>
            )}

            {/* Choose Scoring Approach */}
            <Listbox value={scoringApproach} onChange={setScoringApproach}>
              <div className="relative z-30 flex w-min items-center justify-center">
                <Listbox.Button as="button" title="Switch Scoring Approach" className="hover:opacity-80">
                  <EllipsisHorizontalCircleIcon className="h-6 w-6" aria-hidden="true" />
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute right-0 top-6 w-36 overflow-auto rounded border border-gray-300 bg-gray-100 py-2 shadow xl:w-36">
                    {scoringApproaches.map((approach: string, optionIdx: number) => (
                      <Listbox.Option
                        key={`option-${optionIdx}`}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-1.5 pl-10 pr-5 text-sm font-normal tracking-tight ${
                            active
                              ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                              : 'text-gray-800'
                          }`
                        }
                        value={approach}
                      >
                        <span
                          className={`block whitespace-nowrap ${
                            approach === scoringApproach ? 'font-semibold' : 'font-normal'
                          }`}
                        >
                          Formula {approach}
                        </span>
                        {scoringApproach === approach ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-500">
                            <CheckCircleSolidIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>

            {/* Score information button */}
            <ScoreCalculcationApproachDialog />

            {/* API route source button */}
            <Link
              target="_blank"
              title="Inspect JSON data"
              href="/api/matomo/events/execution-view"
              className="hover:opacity-80"
            >
              <CodeBracketIcon className="h-6 w-6" />
            </Link>

            {/* View Raw JSON button */}
            <button
              title="View Raw JSON data"
              className="hover:opacity-80"
              onClick={() => {
                const jsonString = JSON.stringify(rawData);
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
                window.open(dataUri, '_blank');
              }}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6">
                <path d="M5.759 3.975h1.783V5.76H5.759v4.458A1.783 1.783 0 0 1 3.975 12a1.783 1.783 0 0 1 1.784 1.783v4.459h1.783v1.783H5.759c-.954-.24-1.784-.803-1.784-1.783v-3.567a1.783 1.783 0 0 0-1.783-1.783H1.3v-1.783h.892a1.783 1.783 0 0 0 1.783-1.784V5.76A1.783 1.783 0 0 1 5.76 3.975m12.483 0a1.783 1.783 0 0 1 1.783 1.784v3.566a1.783 1.783 0 0 0 1.783 1.784h.892v1.783h-.892a1.783 1.783 0 0 0-1.783 1.783v3.567a1.783 1.783 0 0 1-1.783 1.783h-1.784v-1.783h1.784v-4.459A1.783 1.783 0 0 1 20.025 12a1.783 1.783 0 0 1-1.783-1.783V5.759h-1.784V3.975h1.784M12 14.675a.892.892 0 0 1 .892.892.892.892 0 0 1-.892.892.892.892 0 0 1-.891-.892.892.892 0 0 1 .891-.892m-3.566 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892m7.133 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892z"></path>
              </svg>
            </button>

            {/* View Processed JSON button */}
            <button
              title="View Processed JSON data"
              className="hover:opacity-80"
              onClick={() => {
                const jsonString = JSON.stringify(processedData);
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
                window.open(dataUri, '_blank');
              }}
            >
              <ScaleIcon className="h-6 w-6" />
            </button>

            {/* Reload button */}
            <button
              title="Retry fetching data"
              className="hover:opacity-80"
              onClick={() => {
                setError(false);
                setWillFetch(true);
              }}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <KPIs data={processedData} />
        {loading && <Loading />}
        {error && <NotFound />}
      </article>
    </Layout>
  );
}

function KPIs({ data }: { data: IExecutionViewGroup[] }) {
  const stats = React.useMemo<ExecutionViewStats>(() => {
    if (data.length === 0)
      return {
        avgScore: null,
        minTime: 0,
        maxTime: 0,
        avgTime: 0,
        stdDevTime: null,
        total: 0,
        completed: 0,
        cancelled: 0,
        discarded: 0,
        notCompleted: 0,
        completedRatio: 0,
      };

    const completed = data.reduce((acc, item) => acc + item.stats.completed, 0);
    const notCompleted = data.reduce((acc, item) => acc + item.stats.notCompleted, 0);
    const total = completed + notCompleted;

    const totalTime = data.reduce((acc, item) => acc + item.stats.avgTimespan * item.stats.total, 0);
    const totalCount = data.reduce((acc, item) => acc + item.stats.total, 0);

    const timespans = data.flatMap((item) => item.executionViews.map((ev) => ev.timespan));
    const minTime = Math.min(...timespans);
    const maxTime = Math.max(...timespans);
    const avgTime = totalCount > 0 ? totalTime / totalCount : 0;
    const stdDevTime = standardDeviation(timespans);

    const allScores = data.map((group) => group.executionViews.map((ev) => ev.score)).flat();
    const allScoreNumbers = allScores.filter((score) => score !== null) as number[];

    const discarded = allScores.length - allScoreNumbers.length;
    const cancelled = notCompleted - discarded;

    const allScoresSum = allScoreNumbers.reduce((acc, score) => acc + score, 0);
    const avgScore = allScoresSum === 0 ? null : allScoresSum / allScoreNumbers.length;

    return {
      avgScore,
      minTime,
      maxTime,
      avgTime,
      stdDevTime,
      total,
      completed,
      cancelled,
      discarded,
      notCompleted,
      completedRatio: total > 0 ? completed / total : 0,
    };
  }, [data]);

  const negativeStats = React.useMemo<ExecutionViewErrorStatsType>(() => {
    let total = 0;
    let errorCount = 0;
    let failedTabCount = 0;
    let tabChangeCount = 0;

    let totalErrors = 0;
    let totalTabChanges = 0;
    let totalFailedTabs = 0;

    data.forEach((item) => {
      item.executionViews.forEach((ev) => {
        total++;
        totalErrors += ev.errorCount;
        totalFailedTabs += ev.failedTabCount;
        totalTabChanges += ev.changeTabCount;

        if (ev.errorCount > 0) errorCount++;
        if (ev.changeTabCount > 0) tabChangeCount++;
        if (ev.failedTabCount > 0) failedTabCount++;
      });
    });

    const avgError = errorCount > 0 ? totalErrors / total : 0;
    const avgTabChanges = tabChangeCount > 0 ? totalTabChanges / total : 0;
    const avgFailedTabs = failedTabCount > 0 ? totalFailedTabs / total : 0;

    return {
      totalErrors,
      totalFailedTabs,
      totalTabChanges,
      avgError,
      avgFailedTabs,
      avgTabChanges,
    };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 self-stretch lg:flex-row">
        <ExecutionViewCompletionRateCard stats={stats} />
        <AverageUXScoreCard stats={stats} />

        <div className="flex flex-1 flex-col items-start justify-start gap-4 self-stretch">
          <GeneralStatsCard stats={stats} />
          <ErrorStatsCard stats={negativeStats} />
        </div>
      </div>
      <ExecutionViewSortedList data={data} />
    </div>
  );
}

function ExecutionViewCompletionRateCard({ stats }: { stats: ExecutionViewStats }) {
  const progress = Math.min(Math.max(stats.completedRatio, 0), 1) * 100;
  const diameter = 120; // Adjusted diameter value
  const strokeWidth = 7; // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative max-w-full overflow-hidden rounded bg-white/80 p-4 dark:bg-white/10 lg:max-w-xs">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-gray-700 dark:text-gray-100">Execution View Completion Rate</h3>
      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Ratio of execution views that were submitted successfully vs. all the execution views started in the platform.
      </p>
      {/* Circular Progress */}
      <div className="mt-2 flex items-center justify-center p-4">
        <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
          <circle
            fill="none"
            stroke="currentColor"
            className="text-emerald-500 opacity-20"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
          />
          <circle
            fill="none"
            className="origin-center -rotate-90 transform stroke-current text-emerald-500"
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
            {stats.completed}/{stats.total}
          </span>
        </div>
      </div>
    </div>
  );
}

function AverageUXScoreCard({ stats }: { stats: ExecutionViewStats }) {
  const diameter = 120; // Adjusted diameter value
  const strokeWidth = 7; // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = stats.avgScore === null ? circumference : circumference - (stats.avgScore / 100) * circumference;

  return (
    <div className="relative max-w-full rounded bg-white/80 p-4 dark:bg-white/10 lg:max-w-xs">
      <div className="flex items-center gap-1.5">
        <h3 className="font-medium text-gray-700 dark:text-gray-100">Execution View Avg UX Score</h3>
        <ScoreCalculcationApproachDialog content={<InformationCircleIcon className="h-5 w-5" />} />
      </div>

      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Average of the usability score given to all the{' '}
        <strong className="underline decoration-blue-500">{stats.total - stats.discarded} non discarded</strong>{' '}
        transactions.
      </p>

      <div className="mt-2 flex items-center justify-center p-4">
        <svg viewBox={`0 0 ${diameter} ${diameter}`} xmlns="http://www.w3.org/2000/svg">
          <circle
            fill="none"
            stroke="currentColor"
            className="text-blue-500 opacity-20"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
          />
          <circle
            fill="none"
            className="origin-center -rotate-90 transform stroke-current text-blue-500"
            r={radius}
            cx={diameter / 2}
            cy={diameter / 2}
            strokeWidth={strokeWidth}
            strokeDashoffset={offset}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute flex w-full flex-col text-center">
          <span className="text-4xl font-bold">{stats.avgScore === null ? 'N/A' : stats.avgScore.toFixed(1)}</span>
          <span className="text-xl">out of 100</span>
        </div>
      </div>
    </div>
  );
}

function GeneralStatsCard({ stats }: { stats: ExecutionViewStats }) {
  const { avgTime, minTime, maxTime, stdDevTime, cancelled, discarded, total, completed } = stats;
  const completedRatio = ((100 * completed) / total).toFixed(1);
  const discardedRatio = ((100 * discarded) / total).toFixed(1);
  const cancelledRatio = ((100 * cancelled) / total).toFixed(1);

  return (
    <div className="relative self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Execution View General Stats</h2>
      <div className="grid w-full grid-cols-1 grid-rows-none gap-x-0 xl:w-min xl:grid-flow-col xl:grid-cols-none xl:grid-rows-4 xl:gap-x-4">
        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-gray-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total: <span className="font-normal">{total}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-emerald-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Completed:{' '}
            <span className="font-normal">
              {completed} ({completedRatio}%)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-amber-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Discarded:{' '}
            <span className="font-normal">
              {discarded} ({discardedRatio}%)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-rose-600" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Cancelled:{' '}
            <span className="font-normal">
              {cancelled} ({cancelledRatio}%)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-blue-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Time to complete transaction: <span className="font-normal">{avgTime.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-pink-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Min Time to complete transaction: <span className="font-normal">{minTime.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-violet-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Max Time to complete transaction: <span className="font-normal">{maxTime.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-lime-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Std Dev for completed transaction times:{' '}
            <span className="font-normal">{stdDevTime === null ? 'N/A' : `${stdDevTime.toFixed(2)}s`}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ErrorStatsCard({ stats }: { stats: ExecutionViewErrorStatsType }) {
  return (
    <div className="relative self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Negative Actions Stats</h2>
      <div className="grid w-full grid-cols-1 grid-rows-none gap-x-0 xl:w-min xl:grid-flow-col xl:grid-cols-none xl:grid-rows-3 xl:gap-x-4">
        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-amber-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total Tab Changes: <span className="font-normal">{stats.totalTabChanges}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-orange-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total Errors: <span className="font-normal">{stats.totalErrors}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-rose-600" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total Failed Tabs: <span className="font-normal">{stats.totalFailedTabs}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-amber-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Tab Changes: <span className="font-normal">{stats.avgTabChanges.toFixed(2)} p/ transaction</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-orange-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Errors: <span className="font-normal">{stats.avgError.toFixed(2)} p/ transaction</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-rose-600" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Failed Tabs: <span className="font-normal">{stats.avgFailedTabs.toFixed(2)} p/ transaction</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ExecutionViewSortedList({ data }: { data: IExecutionViewGroup[] }) {
  const options = [
    'Alphabetic (A to Z)',
    'Alphabetic (Z to A)',
    'Low Score First',
    'High Score First',
    'Low Completion First',
    'High Completion First',
    'Low Frequency First',
    'High Frequency First',
  ];

  const getSortFunction = (picked: any) => {
    switch (picked) {
      case 'Alphabetic (A to Z)':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.name.localeCompare(b.name);
      case 'Alphabetic (Z to A)':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => b.name.localeCompare(a.name);
      case 'Low Score First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => {
          if (a.stats.avgScore === null && b.stats.avgScore === null) return 0;
          if (a.stats.avgScore === null) return 1;
          if (b.stats.avgScore === null) return -1;
          return a.stats.avgScore < b.stats.avgScore ? -1 : 1;
        };
      case 'High Score First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => {
          if (a.stats.avgScore === null && b.stats.avgScore === null) return 0;
          if (a.stats.avgScore === null) return 1;
          if (b.stats.avgScore === null) return -1;
          return a.stats.avgScore > b.stats.avgScore ? -1 : 1;
        };
      case 'Low Completion First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.stats.completedRatio - b.stats.completedRatio;
      case 'High Completion First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => b.stats.completedRatio - a.stats.completedRatio;
      case 'Low Frequency First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.stats.total - b.stats.total;
      case 'High Frequency First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => b.stats.total - a.stats.total;
      default:
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.name.localeCompare(b.name);
    }
  };

  const [picked, setPicked] = React.useState(options[0]);
  const sortedData = React.useMemo(() => {
    const sortFunction = getSortFunction(picked);
    return [...data].sort(sortFunction);
  }, [data, picked]);

  return (
    <div className="relative w-full rounded bg-white/80 p-4 dark:bg-white/10">
      <div className="mb-4 flex w-full flex-col items-center justify-between gap-1 lg:mb-3 lg:flex-row lg:gap-2">
        <h2 className="mb-2 w-full text-center text-sm font-bold tracking-tighter lg:text-left lg:text-xl lg:tracking-normal">
          ExecutionViews Sorted by <span className="underline">{picked}</span>
        </h2>
        <div className="w-full lg:w-auto">
          <Listbox value={picked} onChange={setPicked}>
            <div className="relative w-full min-w-full lg:w-auto lg:min-w-[15rem]">
              <Listbox.Button
                as="button"
                className="inline-flex w-full items-center justify-center gap-x-1 rounded border border-primary bg-primary/50 py-2 pl-3 pr-2 text-center text-sm font-medium tracking-tight text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary dark:bg-secondary/50 dark:hover:bg-secondary/80 lg:px-2 lg:py-1.5"
              >
                <span className="block truncate text-sm font-normal">{picked}</span>
                <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-gray-100 py-2 shadow lg:w-full">
                  {options.map((option: string, optionIdx: number) => (
                    <Listbox.Option
                      key={`option-${optionIdx}`}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-1.5 pl-10 pr-5 text-sm font-normal tracking-tight ${
                          active
                            ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                            : 'text-gray-800'
                        }`
                      }
                      value={option}
                    >
                      <span
                        className={`block whitespace-nowrap ${option === picked ? 'font-semibold' : 'font-normal'}`}
                      >
                        {option}
                      </span>
                      {picked === option ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary dark:text-secondary">
                          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>
      <ul className="flex flex-col gap-y-2 lg:gap-y-3">
        <li className="flex flex-col items-center justify-between gap-2 rounded bg-gray-600 px-2 py-2 text-xs font-normal tracking-tighter dark:bg-gray-400 lg:flex-row lg:px-4 lg:py-3 lg:text-xs lg:font-medium">
          <span className="lg:left w-full rounded text-center font-lexend text-sm font-medium text-white lg:w-auto">
            ExecutionView Name
          </span>
          <span className="flex items-center gap-2 text-center text-[0.65rem] font-normal lg:gap-2 lg:text-[0.65rem] lg:font-medium">
            <span
              title="Average Number of Errors"
              className="flex h-auto w-auto items-center justify-center rounded border border-rose-500 bg-rose-500/70 p-1 text-white group-hover:bg-rose-600 lg:h-12 lg:w-10"
            >
              Avg Errors
            </span>
            <span
              title="Average Number of Tab Changes"
              className="flex h-auto w-auto items-center justify-center rounded border border-orange-500 bg-orange-500/70 p-1 text-white group-hover:bg-orange-500 lg:h-12 lg:w-10"
            >
              Avg TabCh
            </span>
            <span
              title="Average Completed Ratio"
              className="flex h-auto w-auto items-center justify-center rounded border border-emerald-500 bg-emerald-500/70 p-1 text-white group-hover:bg-emerald-500 lg:h-12 lg:w-10"
            >
              Avg Rate
            </span>
            <span
              title="Average UX Score"
              className="flex h-auto w-auto items-center justify-center rounded border border-blue-600 bg-blue-600/70 p-1 text-white group-hover:bg-blue-600 lg:h-12 lg:w-10"
            >
              Avg Score
            </span>
            <span
              title="Total Execution Views Opened"
              className="flex h-auto w-auto items-center justify-center rounded border border-gray-100 bg-gray-100/70 p-1 text-gray-800 group-hover:bg-gray-100 dark:border-gray-200 dark:bg-gray-200/70 dark:group-hover:bg-gray-200 lg:h-12 lg:w-10"
            >
              Total
            </span>
          </span>
        </li>
        {sortedData.map((executionViewGroup, executionViewGroupIdx) => (
          <li key={executionViewGroupIdx}>
            <ExecutionViewGroupFocus executionViewGroup={executionViewGroup} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExecutionViewGroupFocus({ executionViewGroup }: { executionViewGroup: IExecutionViewGroup }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inspect, setInspect] = React.useState(false);
  const [textView, setTextView] = React.useState(false);
  const [inspectIndex, setInspectIndex] = React.useState(0);
  const selectedExecutionView = React.useMemo(
    () => executionViewGroup.executionViews[inspectIndex],
    [executionViewGroup, inspectIndex]
  );

  const { avgError, avgTabChanges } = React.useMemo(() => {
    const totalExecutionViews = executionViewGroup.executionViews.length;
    const totalErrors = executionViewGroup.stats.totalErrors;
    const totalTabChanges = executionViewGroup.stats.totalTabChanges;

    const avgError = totalErrors > 0 ? totalErrors / totalExecutionViews : 0;
    const avgTabChanges = totalTabChanges > 0 ? totalTabChanges / totalExecutionViews : 0;

    return { avgError, avgTabChanges };
  }, [executionViewGroup]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="group flex w-full flex-col items-center justify-between gap-2 rounded border border-primary bg-primary/50 px-2 py-2 text-white transition hover:bg-primary/80 dark:border-secondary dark:bg-secondary/20 dark:hover:bg-secondary/80 lg:flex-row lg:px-4 lg:py-2.5"
      >
        <span className="flex items-center justify-between gap-1.5 text-xs font-normal lg:text-sm lg:font-medium">
          <span className="text-left tracking-tighter lg:tracking-normal">{executionViewGroup.name}</span>
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-1 text-[0.60rem] font-normal lg:gap-2 lg:text-xs lg:font-medium">
          <span
            title="Average Number of Errors"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-500 bg-rose-500/70 text-white group-hover:bg-rose-600 lg:h-10 lg:w-10"
          >
            {executionViewGroup.stats.avgErrors.toFixed(1)}
          </span>
          <span
            title="Average Number of Tab Changes"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-500 bg-orange-500/70 text-white group-hover:bg-orange-500 lg:h-10 lg:w-10"
          >
            {executionViewGroup.stats.avgTabChanges.toFixed(1)}
          </span>
          <span
            title="Average Completed Ratio"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500/70 text-white group-hover:bg-emerald-500 lg:h-10 lg:w-10"
          >
            {(executionViewGroup.stats.completedRatio * 100).toFixed(0)}%
          </span>
          <span
            title="Average UX Score"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-600 bg-blue-600/70 text-white group-hover:bg-blue-600 lg:h-10 lg:w-10"
          >
            {executionViewGroup.stats.avgScore === null ? 'N/A' : executionViewGroup.stats.avgScore.toFixed(1)}
          </span>
          <span
            title="Total ExecutionViews Opened"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-gray-100/70 text-gray-800 group-hover:bg-gray-100 dark:border-gray-200 dark:bg-gray-200/70 dark:group-hover:bg-gray-200 lg:h-10 lg:w-10"
          >
            {executionViewGroup.stats.total}
          </span>
        </span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur dark:bg-white/10" />
          </Transition.Child>

          <div className="fixed right-0 top-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex h-screen w-full transform flex-col justify-between gap-4 overflow-scroll bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-navy md:max-w-3xl">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-800 dark:text-white">
                        <strong>ExecutionView:</strong> <span className="underline">{executionViewGroup.name}</span>
                      </Dialog.Title>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTextView((prev) => !prev)}
                          className="text-primary transition hover:scale-125 hover:opacity-50 dark:text-secondary"
                        >
                          <span className="sr-only">Toggle view mode</span>
                          {textView ? <ChartPieIcon className="h-6 w-6" /> : <DocumentTextIcon className="h-6 w-6" />}
                        </button>
                        <button
                          onClick={closeModal}
                          className="text-rose-600 transition hover:scale-125 hover:opacity-50"
                        >
                          <span className="sr-only">Close modal</span>
                          <XCircleIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="mt-2 font-normal text-gray-700 dark:text-white">
                      {textView ? (
                        <>
                          <p>For this executionView category:</p>
                          <ul className="mt-1 flex list-inside list-disc flex-col gap-1 text-sm text-gray-600 dark:text-gray-200">
                            <li>
                              The <span className="underline">average time spent</span> on this executionView type is{' '}
                              <strong>{executionViewGroup.stats.avgTimespan}s</strong>.{' '}
                              {executionViewGroup.stats.stdDevTimespan === null ? (
                                <>
                                  <span className="underline">Standard deviation analysis</span> is not available
                                  because we don&apos;t have 2 or more executionViews.
                                </>
                              ) : (
                                <>
                                  The standard deviation of time spent on this kind of executionView is{' '}
                                  <strong>{executionViewGroup.stats.stdDevTimespan}</strong>
                                </>
                              )}
                            </li>

                            <li>
                              A total of <strong>{executionViewGroup.stats.total} executionViews were initiated</strong>
                              , {executionViewGroup.stats.completed} were completed, and{' '}
                              {executionViewGroup.stats.notCompleted} were abandoned or cancelled, meaning that{' '}
                              <strong>
                                {(executionViewGroup.stats.completedRatio * 100).toFixed(2)}% of executionViews were
                                completed
                              </strong>
                              .
                            </li>

                            <li>
                              Data was collected for{' '}
                              <strong>{executionViewGroup.executionViews.length} executionView(s)</strong> of this
                              category. There were a total of{' '}
                              <strong>{executionViewGroup.stats.totalErrors} error(s)</strong> across these, alongside a
                              total of <strong>{executionViewGroup.stats.totalTabChanges} tab change(s)</strong>. This
                              means that on average, each executionView had{' '}
                              <strong>{avgError.toFixed(1)} errors</strong> and{' '}
                              <strong>{avgTabChanges.toFixed(1)} tab changes</strong>.{' '}
                              {executionViewGroup.stats.stdDevScore === null ? (
                                <>
                                  <span className="underline">Standard deviation analysis</span> for UX Score is not
                                  available because we don&apos;t have 2 or more executionViews.
                                </>
                              ) : (
                                <>
                                  The standard deviation of UX Score on this kind of executionView is{' '}
                                  <strong>{executionViewGroup.stats.stdDevScore}</strong>
                                </>
                              )}
                            </li>

                            <li>
                              The average score was{' '}
                              <strong>
                                {executionViewGroup.stats.avgScore === null
                                  ? 'N/A'
                                  : executionViewGroup.stats.avgScore.toFixed(2)}{' '}
                                out of a possible 100 points
                              </strong>
                              . This score is calculated based on the amount of executionView errors, step errors and
                              tab changes, where we deduct point to a executionView based on negative actions.
                              <Formula />
                            </li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <p className="mb-2 text-sm">Here are some key stats for executionViews of this category</p>

                          <div className="flex flex-wrap gap-x-4 gap-y-4">
                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-blue-600 bg-blue-600/60 text-center text-white dark:border-blue-500 dark:bg-blue-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.avgTimespan.toFixed(1)}s
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Average Time Spent on ExecutionView
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-blue-600 bg-blue-600/60 text-center text-white dark:border-blue-500 dark:bg-blue-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.stdDevTimespan === null ? (
                                  'N/A'
                                ) : (
                                  <>{executionViewGroup.stats.stdDevTimespan.toFixed(1)}s</>
                                )}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Std Dev for Time Spent on ExecutionView
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-gray-600 bg-gray-600/60 text-center text-white dark:border-gray-500 dark:bg-gray-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.total}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Total ExecutionViews Initiated
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-teal-600 bg-teal-600/60 text-center text-white dark:border-teal-500 dark:bg-teal-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.completed}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Total ExecutionViews Completed
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-rose-600 bg-rose-600/60 text-center text-white dark:border-rose-500 dark:bg-rose-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.notCompleted}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Total ExecutionViews Abandoned
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-violet-600 bg-violet-600/60 text-center text-white dark:border-violet-500 dark:bg-violet-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.avgScore}/100
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Average ExecutionView UX Score
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-violet-600 bg-violet-600/60 text-center text-white dark:border-violet-500 dark:bg-violet-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.stdDevScore === null
                                  ? 'N/A'
                                  : executionViewGroup.stats.stdDevScore.toFixed(1)}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Std Dev for ExecutionView UX Score
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-gray-600 bg-gray-600/60 text-center text-white dark:border-gray-500 dark:bg-gray-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {(executionViewGroup.stats.completedRatio * 100).toFixed(1)}%
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                ExecutionView Completion Ratio
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-amber-600 bg-amber-600/60 text-center text-white dark:border-amber-500 dark:bg-amber-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.totalTabChanges}
                                <span className="font-sans font-light"> &middot; </span>
                                {executionViewGroup.stats.avgTabChanges.toFixed(1)}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Total and Average Tab Changes
                              </span>
                            </div>

                            <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-rose-600 bg-rose-600/60 text-center text-white dark:border-rose-500 dark:bg-rose-500/40">
                              <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                                {executionViewGroup.stats.totalErrors}
                                <span className="font-sans font-light"> &middot; </span>
                                {executionViewGroup.stats.avgErrors.toFixed(1)}
                              </span>
                              <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                                Total and Average Errors
                              </span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm">
                              This score is calculated based on the amount of executionView errors, step errors and tab
                              changes, where we deduct point to a executionView based on negative actions.
                            </p>
                            <Formula />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Inspect executionViews view */}
                    {inspect ? (
                      <div className="flex gap-4">
                        {/* ExecutionView Inspect Card */}
                        <div className="flex-1 rounded-xl bg-navy text-white dark:bg-white/10">
                          <div className="flex items-center justify-between rounded-t border-b px-2 py-2 lg:px-3 lg:py-3">
                            <h4 className="tracking-[-0.08rem] lg:tracking-normal">
                              {selectedExecutionView.component}
                            </h4>
                            <span
                              className={classNames(
                                'flex items-center gap-1 rounded-full border p-1 text-sm text-white lg:rounded lg:p-1',
                                selectedExecutionView.completed
                                  ? 'border-teal-600 bg-teal-600/80'
                                  : 'border-rose-600 bg-rose-600/80'
                              )}
                            >
                              {selectedExecutionView.completed ? (
                                <CheckCircleIcon className="h-5 w-5" />
                              ) : (
                                <XCircleIcon className="h-5 w-5" />
                              )}
                              <span className="hidden lg:flex">
                                {selectedExecutionView.completed ? 'Completed' : 'Abandoned'}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between rounded-b px-3 py-3 lg:px-4 lg:py-4">
                            <div className="space-y-0.5 lg:space-y-1">
                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-rose-600" />
                                <span className="whitespace-nowrap text-sm tracking-tighter lg:tracking-normal">
                                  Errors: <span className="font-normal">{selectedExecutionView.errorCount}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-amber-600" />
                                <span className="whitespace-nowrap text-sm tracking-tighter lg:tracking-normal">
                                  Tab Changes:{' '}
                                  <span className="font-normal">{selectedExecutionView.changeTabCount}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-blue-600" />
                                <span className="whitespace-nowrap text-sm tracking-tighter lg:tracking-normal">
                                  Timespan:{' '}
                                  <span className="font-normal">{selectedExecutionView.timespan.toFixed(1)}s</span>
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <CircularProgressBadge progress={selectedExecutionView.score} />
                                <span className="text-center text-xs tracking-tighter">UX Score</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ExecutionView Scroll Buttons */}
                        <div className="flex flex-col rounded-xl bg-navy text-white dark:bg-white/10">
                          <button
                            disabled={inspectIndex === 0}
                            onClick={() => setInspectIndex((idx) => idx - 1)}
                            className="group self-stretch rounded-t-xl px-2 py-2 transition enabled:hover:bg-sky-600/50 disabled:cursor-not-allowed disabled:opacity-20 dark:disabled:text-white"
                          >
                            <ChevronUpIcon className="h-5 w-5" />
                          </button>

                          <span className="flex flex-1 items-center justify-center self-stretch px-2 py-2">
                            {inspectIndex}
                          </span>

                          <button
                            disabled={inspectIndex === executionViewGroup.executionViews.length - 1}
                            onClick={() => setInspectIndex((idx) => idx + 1)}
                            className="group self-stretch rounded-b-xl px-2 py-2 transition enabled:hover:bg-sky-600/50 disabled:cursor-not-allowed disabled:opacity-20 dark:disabled:text-white"
                          >
                            <ChevronDownIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Footer buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setInspect((prev) => !prev)}
                      className={classNames(
                        inspect ? 'bg-rose-700' : 'bg-sky-700',
                        'flex items-center gap-2 rounded px-4 py-2 text-sm text-white transition hover:opacity-80'
                      )}
                    >
                      {inspect ? <span>Hide</span> : <span>Inspect</span>}
                      {inspect ? (
                        <MagnifyingGlassMinusIcon className="h-5 w-5" />
                      ) : (
                        <MagnifyingGlassPlusIcon className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2 rounded bg-teal-600 px-4 py-2 text-sm text-white transition hover:opacity-80"
                      onClick={closeModal}
                    >
                      <span>Got it!</span>
                      <span>
                        <CheckCircleIcon className="h-5 w-5" />
                      </span>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function ScoreCalculcationApproachDialog({ content }: { content?: any }) {
  const [isOpen, setIsOpen] = React.useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button type="button" onClick={openModal} className="underline hover:opacity-80">
        {content ? content : <InformationCircleIcon className="h-6 w-6" />}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur dark:bg-white/10" />
          </Transition.Child>

          <div className="fixed right-0 top-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex h-screen w-full transform flex-col justify-between gap-4 overflow-scroll bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-navy md:max-w-3xl">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="mb-3 font-sans text-lg font-bold leading-6 text-gray-800 dark:text-white"
                    >
                      Execution Views Scoring Approach
                    </Dialog.Title>

                    <div className="mt-2 font-normal text-gray-700 dark:text-white">
                      The score is a number between 0 and 100. This score is calculated based on the amount of{' '}
                      <strong>execution views errors</strong>, <strong>step errors</strong> and{' '}
                      <strong>tab changes</strong> button clicks, where we deduct points to a execution view based on
                      negative actions. The initial score is 100, and we subtract from there as follows:
                      <Formula />
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 bg-teal-600/20 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-600 hover:text-white dark:text-white"
                      onClick={closeModal}
                    >
                      <span>Roger that</span>
                      <CheckCircleSolidIcon className="h-4 w-4" />
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function Formula() {
  return (
    <div className="my-1 text-sm">
      <p className="mb-1">First we establish a baseline score:</p>
      <code className="mb-4 block bg-navy px-3 py-2 text-sm font-normal tracking-[-0.07rem] text-white dark:bg-white/10 dark:text-white">
        score = 100 - 10*errors - 5*backSteps
      </code>

      <p className="mb-1 mt-3">
        If the <strong>execution view was cancelled</strong> we deduct extra points. In case the user was evidently
        attempting to complete it then the <strong>timespan should be greater than 10s</strong> and/or{' '}
        <strong>there should be at least one negative action</strong>:
      </p>
      <code className="mb-4 block bg-navy px-3 py-2 text-sm font-normal tracking-[-0.07rem] text-white dark:bg-white/10 dark:text-white">
        score = score - timespan/20 - 4*(errors + backStepCount)
      </code>

      <p className="mb-1 mt-3">
        If there are <strong>no negative actions</strong> or the <strong>timespan was under 10 seconds</strong> we only
        deduct a small amount:
      </p>
      <code className="mb-4 block bg-navy px-3 py-2 text-sm font-normal tracking-[-0.07rem] text-white dark:bg-white/10 dark:text-white">
        score = score - 5
      </code>

      <p className="mt-3">
        The <strong>minimum score is 0</strong>, so if the score drops below that, we directly assign it a score of 0.
        In case the score is <strong>below 40 and the execution view was completed</strong> we directly assign a score
        of 40 to the execution view, rewarding the completion.
      </p>
    </div>
  );
}
