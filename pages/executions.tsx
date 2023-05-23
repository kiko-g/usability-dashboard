import React, { Fragment } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { IExecutionView, IExecutionViewGroup } from '../@types';
import { mockExecutionViewData as mockData } from '../utils/mock';
import { Layout } from '../components/layout';
import { CircularProgressBadge, Loading, NotFound } from '../components/utils';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { ExecutionViewAction } from '../utils/matomo';
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
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

type CompletionRate = {
  completed: number;
  notCompleted: number;
  ratio: number;
};

export default function Executions() {
  const [data, setData] = React.useState<IExecutionViewGroup[]>([]); // TODO: replace any with correct type
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

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
      .then((data: IExecutionViewGroup[]) => {
        // TODO: replace any with correct type
        setLoading(false);
        setWillFetch(false);
        setData(data === null ? [] : data);
      });
  }, [willFetch]);

  return (
    <Layout location="Execution Views">
      <article className="flex flex-col justify-center gap-1">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Execution View Insights</h1>
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <p className="max-w-4xl grow text-lg font-normal">
            Inspect how your users are using the <span className="font-bold underline">execution views</span> across the
            platform.
          </p>

          <div className="flex items-center gap-2">
            {error === false ? null : (
              <button
                title="Use mock data"
                className="hover:opacity-80"
                onClick={() => {
                  setError(false);
                  setData(mockData);
                }}
              >
                <CircleStackIcon className="h-6 w-6" />
              </button>
            )}

            <Link
              target="_blank"
              title="Inspect JSON data"
              href="/api/matomo/events/execution-view"
              className="hover:opacity-80"
            >
              <CodeBracketIcon className="h-6 w-6" />
            </Link>

            <button
              title="Retry fetching data"
              className="hover:opacity-80"
              onClick={() => {
                setWillFetch(true);
              }}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <ExecutionViewKPIs data={data} />
        {loading && <Loading />}
        {error && <NotFound />}
      </article>
    </Layout>
  );
}

// TODO: replace any with correct type
function ExecutionViewKPIs({ data }: { data: IExecutionViewGroup[] }) {
  // calculate average score considering all execution views
  const avgScore = React.useMemo<number | null>(() => {
    if (data.length === 0) return null;

    const sum = data.reduce((acc, item) => acc + item.stats.avgScore, 0);
    return data.length > 0 ? sum / data.length : 0;
  }, [data]);

  // calculate average completion rate considering all execution views
  const completionRate = React.useMemo<CompletionRate | null>(() => {
    if (data.length === 0) return null;

    const completed = data.reduce((acc, item) => acc + item.stats.completed, 0);
    const notCompleted = data.reduce((acc, item) => acc + item.stats.notCompleted, 0);
    const total = completed + notCompleted;

    return {
      completed: completed,
      notCompleted: notCompleted,
      ratio: total > 0 ? completed / total : 0,
    };
  }, [data]);

  // calculate average, minimum and maximum time considering all execution views
  const timeStats = React.useMemo(() => {
    const totalTime = data.reduce((acc, item) => acc + item.stats.avgTimespan * item.stats.total, 0);
    const totalCount = data.reduce((acc, item) => acc + item.stats.total, 0);

    const timespans = data.flatMap((item) => item.executionViews.map((item) => item.timespan));
    const minTime = Math.min(...timespans);
    const maxTime = Math.max(...timespans);
    const averageTime = totalCount > 0 ? totalTime / totalCount : 0;

    return { avg: averageTime, min: minTime, max: maxTime };
  }, [data]);

  // calculate average, minimum and maximum error and tab changes considering all execution views
  const errorAndTabChangeStats = React.useMemo(() => {
    let totalExecutionViews = 0;

    let totalErrors = 0;
    let totalTabChanges = 0;
    let errorCount = 0;
    let tabChangeStepCount = 0;

    data.forEach((item) => {
      item.executionViews.forEach((executionView) => {
        totalExecutionViews++;
        totalErrors += executionView.errorCount;
        totalTabChanges += executionView.tabChangeCount;

        if (executionView.errorCount > 0) {
          errorCount++;
        }
        if (executionView.tabChangeCount > 0) {
          tabChangeStepCount++;
        }
      });
    });

    const avgError = errorCount > 0 ? totalErrors / totalExecutionViews : 0;
    const avgTabChange = tabChangeStepCount > 0 ? totalTabChanges / totalExecutionViews : 0;

    return { avgError, totalErrors, avgTabChange, totalTabChanges };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 self-stretch lg:flex-row">
        {completionRate === null ? null : <ExecutionViewCompletionRateCard completion={completionRate} />}
        {avgScore === null ? null : <ExecutionViewAverageUXScoreCard score={avgScore} />}

        <div className="flex flex-1 flex-col items-start justify-start gap-4 self-stretch">
          <TimeStatsCard stats={timeStats} />
          <ErrorStatsCard text="Negative Actions Stats" stats={errorAndTabChangeStats} />
        </div>
      </div>
      <ExecutionViewSortedList data={data} />
    </div>
  );
}

function ExecutionViewCompletionRateCard({ completion }: { completion: CompletionRate }) {
  const progress = Math.min(Math.max(completion.ratio, 0), 1) * 100;
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
            {completion.completed}/{completion.completed + completion.notCompleted}
          </span>
        </div>
      </div>
    </div>
  );
}

function ExecutionViewAverageUXScoreCard({ score }: { score: number }) {
  const diameter = 120; // Adjusted diameter value
  const strokeWidth = 7; // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative max-w-full rounded bg-white/80 p-4 dark:bg-white/10 lg:max-w-xs">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-gray-700 dark:text-gray-100">Execution Views Average UX Score</h3>
      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Ratio of execution views that were submitted successfully vs. all the execution views started in the platform.
        Score is calculated based on <ScoreCalculcationApproachDialog />.
      </p>
      {/* Circular Progress */}
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
          <span className="text-4xl font-bold">{score.toFixed(1)}</span>
          <span className="text-xl">out of 100</span>
        </div>
      </div>
    </div>
  );
}

type AvgMinMax = {
  avg: number;
  min: number;
  max: number;
};

function TimeStatsCard({ stats }: { stats: AvgMinMax }) {
  const { avg, min, max } = stats;

  return (
    <div className="relative flex flex-1 flex-col self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Execution View Time Stats</h2>
      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-blue-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average: <span className="font-normal">{avg.toFixed(2)}s</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-pink-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Minimum: <span className="font-normal">{min.toFixed(2)}s</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-violet-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Maximum: <span className="font-normal">{max.toFixed(2)}s</span>
        </span>
      </div>
    </div>
  );
}

type ErrorStatsCard = {
  avgError: number;
  totalErrors: number;
  avgTabChange: number;
  totalTabChanges: number;
};

function ErrorStatsCard({ text, stats }: { text: string; stats: ErrorStatsCard }) {
  const { avgError, totalErrors, avgTabChange, totalTabChanges } = stats;

  return (
    <div className="relative flex flex-1 flex-col self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">{text}</h2>
      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-rose-600" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Total Errors: <span className="font-normal">{totalErrors}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-orange-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Total Tab Changes: <span className="font-normal">{totalTabChanges}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-rose-600" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average Errors: <span className="font-normal">{avgError.toFixed(2)} per Execution View</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-orange-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average Tab Changes: <span className="font-normal">{avgTabChange.toFixed(2)} per execution view</span>
        </span>
      </div>
    </div>
  );
}

function ExecutionViewSortedList({ data }: { data: IExecutionViewGroup[] }) {
  const options = [
    'Low Score First',
    'High Score First',
    'Low Completion First',
    'High Completion First',
    'Low Frequency First',
    'High Frequency First',
  ];

  const getSortFunction = (picked: any) => {
    switch (picked) {
      case 'Low Score First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.stats.avgScore - b.stats.avgScore;
      case 'High Score First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => b.stats.avgScore - a.stats.avgScore;
      case 'Low Completion First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.stats.completedRatio - b.stats.completedRatio;
      case 'High Completion First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => b.stats.completedRatio - a.stats.completedRatio;
      case 'Low Frequency First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.stats.total - b.stats.total;
      case 'High Frequency First':
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => b.stats.total - a.stats.total;
      default:
        return (a: IExecutionViewGroup, b: IExecutionViewGroup) => a.stats.avgScore - b.stats.avgScore;
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
            {executionViewGroup.stats.avgScore.toFixed(1)}
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-navy">
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
                                <span className="underline">Standard deviation analysis</span> is not available because
                                we don&apos;t have 2 or more executionViews.
                              </>
                            ) : (
                              <>
                                The standard deviation of time spent on this kind of executionView is{' '}
                                <strong>{executionViewGroup.stats.stdDevTimespan}</strong>
                              </>
                            )}
                          </li>

                          <li>
                            A total of <strong>{executionViewGroup.stats.total} executionViews were initiated</strong>,{' '}
                            {executionViewGroup.stats.completed} were completed, and{' '}
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
                            means that on average, each executionView had <strong>{avgError.toFixed(1)} errors</strong>{' '}
                            and <strong>{avgTabChanges.toFixed(1)} tab changes</strong>.{' '}
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
                            <strong>{executionViewGroup.stats.avgScore.toFixed(2)} out of a possible 100 points</strong>
                            . This score is calculated based on the amount of executionView errors, step errors and tab
                            changes, where we deduct point to a executionView based on negative actions.
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
                        <div className="flex items-center justify-between rounded-t border-b px-3 py-3 lg:px-4 lg:py-4">
                          <h4 className="tracking-[-0.08rem] lg:tracking-normal">{selectedExecutionView.component}</h4>
                          <span
                            className={classNames(
                              'flex gap-1 rounded-full border p-1 text-sm text-white lg:rounded lg:p-1.5',
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
                                Tab Changes: <span className="font-normal">{selectedExecutionView.tabChangeCount}</span>
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

                  {/* Footer buttons */}
                  <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setInspect((prev) => !prev)}
                      className={classNames(
                        inspect ? 'bg-rose-600' : 'bg-teal-600',
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
                      className="flex items-center gap-2 rounded bg-gray-500 px-4 py-2 text-sm text-white transition hover:opacity-80"
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

function ScoreCalculcationApproachDialog() {
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
        this approach
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-navy">
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

                  <div className="mt-8 flex items-center justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white transition hover:opacity-80 dark:bg-secondary"
                      onClick={closeModal}
                    >
                      <span>Got it, thanks!</span>
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
    <code className="my-4 block bg-navy px-3 py-2 text-sm font-normal tracking-[-0.07rem] text-white dark:bg-white/10 dark:text-white">
      score = max(0, 100 - 10*errors - 5*tabChanges - 8*cancels)
    </code>
  );
}
