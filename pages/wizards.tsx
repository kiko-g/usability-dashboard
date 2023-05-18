import React, { Fragment } from 'react';
import type { IWizardGroup } from '../@types';
import { mockWizardData } from '../utils/mock';
import { Layout } from '../components/layout';
import { CircularProgressBadge, Loading, NotFound } from '../components/utils';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { WizardAction } from '../utils/matomo';
import {
  ArrowPathIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  CircleStackIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

export default function Wizards() {
  return (
    <Layout location="Wizards">
      <main className="space-y-6">
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Wizard Insights</h1>
          <p className="mb-2 max-w-4xl grow text-lg font-normal">
            Inspect how your users are using the wizards across the platform.
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

    const sum = data.reduce((acc, item) => acc + item.stats.avgScore, 0);
    return data.length > 0 ? sum / data.length : 0;
  }, [data]);

  // calculate average completion rate considering all wizards
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

  // calculate average, minimum and maximum time considering all wizards
  const wizardTimeStats = React.useMemo(() => {
    const totalTime = data.reduce((acc, item) => acc + item.stats.avgTimespan * item.stats.total, 0);
    const totalCount = data.reduce((acc, item) => acc + item.stats.total, 0);

    const timespans = data.flatMap((item) => item.wizards.map((wizard) => wizard.timespan));
    const minTime = Math.min(...timespans);
    const maxTime = Math.max(...timespans);
    const averageTime = totalCount > 0 ? totalTime / totalCount : 0;

    return { avg: averageTime, min: minTime, max: maxTime };
  }, [data]);

  const stepCompletionStats = React.useMemo(() => {
    let activatedStepsTotal = 0;
    let successStepsTotal = 0;
    let failedStepTotal = 0;

    data.forEach((wizardGroup) => {
      wizardGroup.wizards.forEach((wizard) => {
        wizard.events.forEach((event) => {
          const action = event.action;
          if (action.includes(WizardAction.ActivateStep)) {
            activatedStepsTotal++;
          } else if (action.includes(WizardAction.SuccessStep)) {
            successStepsTotal++;
          } else if (action.includes(WizardAction.FailStep)) {
            failedStepTotal++;
          }
        });
      });
    });

    return { activated: activatedStepsTotal, successful: successStepsTotal, failed: failedStepTotal };
  }, [data]);

  // calculate average, minimum and maximum error and back step considering all wizards
  const errorAndBackStepStats = React.useMemo(() => {
    let totalWizards = 0;

    let totalErrors = 0;
    let totalBackSteps = 0;
    let errorCount = 0;
    let backStepCount = 0;

    data.forEach((item) => {
      item.wizards.forEach((wizard) => {
        totalWizards++;
        totalErrors += wizard.errorCount;
        totalBackSteps += wizard.backStepCount;

        if (wizard.errorCount > 0) {
          errorCount++;
        }
        if (wizard.backStepCount > 0) {
          backStepCount++;
        }
      });
    });

    const avgError = errorCount > 0 ? totalErrors / totalWizards : 0;
    const avgBack = backStepCount > 0 ? totalBackSteps / totalWizards : 0;

    return { avgError, totalErrors, avgBack, totalBackSteps };
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
      <div className="flex flex-1 flex-col gap-4 self-stretch lg:flex-row">
        {completionRate === null ? null : <WizardCompletionRateCard completion={completionRate} />}
        {avgScore === null ? null : <WizardAverageUXScoreCard score={avgScore} />}
        <div className="flex flex-1 flex-col items-start justify-start gap-4 self-stretch">
          <TimeStatsCard stats={wizardTimeStats} />
          <StepCompletionStatsCard stats={stepCompletionStats} />
          <ErrorStatsCard text="Negative Actions Stats" stats={errorAndBackStepStats} />
        </div>
      </div>
      <WizardSortedList data={data} />
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
    <div className="relative max-w-full overflow-hidden rounded bg-white/80 p-4 dark:bg-white/10 lg:max-w-xs">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-slate-700 dark:text-slate-100">Wizard Completion Rate</h3>
      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Ratio of wizards that were submitted successfully vs. all the wizards started in the platform.
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

function WizardAverageUXScoreCard({ score }: { score: number }) {
  const diameter = 120; // Adjusted diameter value
  const strokeWidth = 7; // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative max-w-full rounded bg-white/80 p-4 dark:bg-white/10 lg:max-w-xs">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-slate-700 dark:text-slate-100">Wizard Average UX Score</h3>
      <p className="mt-1 min-h-[5rem] text-sm tracking-tight">
        Ratio of wizards that were submitted successfully vs. all the wizards started in the platform. Score is
        calculated based on <ScoreCalculcationApproachDialog />.
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
      <h2 className="mb-2 text-xl font-bold">Wizard Time Stats</h2>
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

type StepCompletionStats = {
  activated: number;
  successful: number;
  failed: number;
};

function StepCompletionStatsCard({ stats }: { stats: StepCompletionStats }) {
  const { activated, successful, failed } = stats;

  return (
    <div className="relative flex flex-1 flex-col self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Step Completion Stats</h2>
      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-blue-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          All activated steps: <span className="font-normal">{activated}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-pink-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Successful steps: <span className="font-normal">{successful}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-violet-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Failed steps: <span className="font-normal">{failed}</span>
        </span>
      </div>
    </div>
  );
}

type ErrorStatsCard = {
  avgError: number;
  totalErrors: number;
  avgBack: number;
  totalBackSteps: number;
};

function ErrorStatsCard({ text, stats }: { text: string; stats: ErrorStatsCard }) {
  const { avgError, totalErrors, avgBack, totalBackSteps } = stats;

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
          Total Backs: <span className="font-normal">{totalBackSteps}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-rose-600" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average Errors: <span className="font-normal">{avgError.toFixed(2)} per wizard</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-orange-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average Backs: <span className="font-normal">{avgBack.toFixed(2)} per wizard</span>
        </span>
      </div>
    </div>
  );
}

function WizardSortedList({ data }: { data: IWizardGroup[] }) {
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
        return (a: IWizardGroup, b: IWizardGroup) => a.stats.avgScore - b.stats.avgScore;
      case 'High Score First':
        return (a: IWizardGroup, b: IWizardGroup) => b.stats.avgScore - a.stats.avgScore;
      case 'Low Completion First':
        return (a: IWizardGroup, b: IWizardGroup) => a.stats.completedRatio - b.stats.completedRatio;
      case 'High Completion First':
        return (a: IWizardGroup, b: IWizardGroup) => b.stats.completedRatio - a.stats.completedRatio;
      case 'Low Frequency First':
        return (a: IWizardGroup, b: IWizardGroup) => a.stats.total - b.stats.total;
      case 'High Frequency First':
        return (a: IWizardGroup, b: IWizardGroup) => b.stats.total - a.stats.total;
      default:
        return (a: IWizardGroup, b: IWizardGroup) => a.stats.avgScore - b.stats.avgScore;
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
          Wizards Sorted by <span className="underline">{picked}</span>
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
        <li className="flex flex-col items-center justify-between gap-2 rounded bg-slate-600 px-2 py-2 text-xs font-normal tracking-tighter dark:bg-slate-400 lg:flex-row lg:px-4 lg:py-3 lg:text-xs lg:font-medium">
          <span className="lg:left w-full rounded text-center font-lexend text-sm font-medium text-white lg:w-auto">
            Wizard Name
          </span>
          <span className="flex items-center gap-2 text-center text-[0.65rem] font-normal lg:gap-2 lg:text-[0.65rem] lg:font-medium">
            <span
              title="Average Number of Errors"
              className="flex h-auto w-auto items-center justify-center rounded border border-rose-500 bg-rose-500/70 p-1 text-white group-hover:bg-rose-600 lg:h-12 lg:w-10"
            >
              Avg Errors
            </span>
            <span
              title="Average Number of Back to Previous Step Clicks"
              className="flex h-auto w-auto items-center justify-center rounded border border-orange-500 bg-orange-500/70 p-1 text-white group-hover:bg-orange-500 lg:h-12 lg:w-10"
            >
              Avg Backs
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
              title="Total Wizards Opened"
              className="flex h-auto w-auto items-center justify-center rounded border border-slate-100 bg-slate-100/70 p-1 text-gray-800 group-hover:bg-slate-100 dark:border-slate-200 dark:bg-slate-200/70 dark:group-hover:bg-slate-200 lg:h-12 lg:w-10"
            >
              Total Wizards
            </span>
          </span>
        </li>
        {sortedData.map((wizardGroup, wizardGroupIdx) => (
          <li key={wizardGroupIdx}>
            <WizardGroupFocus wizardGroup={wizardGroup} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function WizardGroupFocus({ wizardGroup }: { wizardGroup: IWizardGroup }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inspect, setInspect] = React.useState(false);
  const [textView, setTextView] = React.useState(false);
  const [inspectIndex, setInspectIndex] = React.useState(0);
  const selectedWizard = React.useMemo(() => wizardGroup.wizards[inspectIndex], [wizardGroup, inspectIndex]);

  const { avgError, avgBack } = React.useMemo(() => {
    const totalWizards = wizardGroup.wizards.length;
    const totalErrors = wizardGroup.stats.totalErrors;
    const totalBackSteps = wizardGroup.stats.totalBackSteps;

    const avgError = totalErrors > 0 ? totalErrors / totalWizards : 0;
    const avgBack = totalBackSteps > 0 ? totalBackSteps / totalWizards : 0;

    return { avgError, avgBack };
  }, [wizardGroup]);

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
          <span className="text-left tracking-tighter lg:tracking-normal">{wizardGroup.name}</span>
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-1 text-[0.60rem] font-normal lg:gap-2 lg:text-xs lg:font-medium">
          <span
            title="Average Number of Errors"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-500 bg-rose-500/70 text-white group-hover:bg-rose-600 lg:h-10 lg:w-10"
          >
            {wizardGroup.stats.avgErrors.toFixed(1)}
          </span>
          <span
            title="Average Number of Back to Previous Step Clicks"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-500 bg-orange-500/70 text-white group-hover:bg-orange-500 lg:h-10 lg:w-10"
          >
            {wizardGroup.stats.avgBackSteps.toFixed(1)}
          </span>
          <span
            title="Average Completed Ratio"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500/70 text-white group-hover:bg-emerald-500 lg:h-10 lg:w-10"
          >
            {(wizardGroup.stats.completedRatio * 100).toFixed(0)}%
          </span>
          <span
            title="Average UX Score"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-600 bg-blue-600/70 text-white group-hover:bg-blue-600 lg:h-10 lg:w-10"
          >
            {wizardGroup.stats.avgScore.toFixed(1)}
          </span>
          <span
            title="Total Wizards Opened"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-100 bg-slate-100/70 text-gray-800 group-hover:bg-slate-100 dark:border-slate-200 dark:bg-slate-200/70 dark:group-hover:bg-slate-200 lg:h-10 lg:w-10"
          >
            {wizardGroup.stats.total}
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
                    <Dialog.Title as="h3" className="mb-2 text-lg font-bold leading-6 text-slate-800 dark:text-white">
                      <strong>Wizard:</strong> <span className="underline">{wizardGroup.name}</span>
                    </Dialog.Title>

                    <button
                      onClick={() => setTextView((prev) => !prev)}
                      className="text-primary transition hover:scale-125 hover:opacity-50 dark:text-secondary"
                    >
                      <span className="sr-only">Toggle view mode</span>
                      {textView ? <ChartPieIcon className="h-6 w-6" /> : <DocumentTextIcon className="h-6 w-6" />}
                    </button>
                  </div>

                  {/* KPIs */}
                  <div className="mt-2 font-normal text-gray-700 dark:text-white">
                    {textView ? (
                      <>
                        <p>For this wizard category:</p>
                        <ul className="mt-1 flex list-inside list-disc flex-col gap-1 text-sm text-gray-600 dark:text-gray-200">
                          <li>
                            The <span className="underline">average time spent</span> on this wizard type is{' '}
                            <strong>{wizardGroup.stats.avgTimespan}s</strong>.{' '}
                            {wizardGroup.stats.stdDevTimespan === null ? (
                              <>
                                <span className="underline">Standard deviation analysis</span> is not available because
                                we don&apos;t have 2 or more wizards.
                              </>
                            ) : (
                              <>
                                The standard deviation of time spent on this kind of wizard is{' '}
                                <strong>{wizardGroup.stats.stdDevTimespan}</strong>
                              </>
                            )}
                          </li>

                          <li>
                            A total of <strong>{wizardGroup.stats.total} wizards were initiated</strong>,{' '}
                            {wizardGroup.stats.completed} were completed, and {wizardGroup.stats.notCompleted} were
                            abandoned or cancelled, meaning that{' '}
                            <strong>
                              {(wizardGroup.stats.completedRatio * 100).toFixed(2)}% of wizards were completed
                            </strong>
                            .
                          </li>

                          <li>
                            Data was collected for <strong>{wizardGroup.wizards.length} wizard(s)</strong> of this
                            category. There were a total of <strong>{wizardGroup.stats.totalErrors} error(s)</strong>{' '}
                            across these, alongside a total of{' '}
                            <strong>{wizardGroup.stats.totalBackSteps} back to previous step click(s)</strong>. This
                            means that on average, each wizard had <strong>{avgError.toFixed(1)} errors</strong> and{' '}
                            <strong>{avgBack.toFixed(1)} back steps</strong>.{' '}
                            {wizardGroup.stats.stdDevScore === null ? (
                              <>
                                <span className="underline">Standard deviation analysis</span> for UX Score is not
                                available because we don&apos;t have 2 or more wizards.
                              </>
                            ) : (
                              <>
                                The standard deviation of UX Score on this kind of wizard is{' '}
                                <strong>{wizardGroup.stats.stdDevScore}</strong>
                              </>
                            )}
                          </li>

                          <li>
                            The average score was{' '}
                            <strong>{wizardGroup.stats.avgScore.toFixed(2)} out of a possible 100 points</strong>. This
                            score is calculated based on the amount of wizard errors, step errors and back to previous
                            step button clicks, where we deduct point to a wizard based on negative actions.
                            <Formula />
                          </li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-sm">Here are some key stats for wizards of this category</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-4">
                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-blue-600 bg-blue-600/60 text-center text-white dark:border-blue-500 dark:bg-blue-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.avgTimespan.toFixed(1)}s
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Average Time Spent on Wizard
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-blue-600 bg-blue-600/60 text-center text-white dark:border-blue-500 dark:bg-blue-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.stdDevTimespan === null ? (
                                'N/A'
                              ) : (
                                <>{wizardGroup.stats.stdDevTimespan.toFixed(1)}s</>
                              )}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Std Dev for Time Spent on Wizard
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-slate-600 bg-slate-600/60 text-center text-white dark:border-slate-500 dark:bg-slate-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.total}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Total Wizards Initiated
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-teal-600 bg-teal-600/60 text-center text-white dark:border-teal-500 dark:bg-teal-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.completed}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Total Wizards Completed
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-rose-600 bg-rose-600/60 text-center text-white dark:border-rose-500 dark:bg-rose-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.notCompleted}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Total Wizards Abandoned
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-violet-600 bg-violet-600/60 text-center text-white dark:border-violet-500 dark:bg-violet-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.avgScore}/100
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Average Wizard UX Score
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-violet-600 bg-violet-600/60 text-center text-white dark:border-violet-500 dark:bg-violet-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.stdDevScore === null
                                ? 'N/A'
                                : wizardGroup.stats.stdDevScore.toFixed(1)}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Std Dev for Wizard UX Score
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-slate-600 bg-slate-600/60 text-center text-white dark:border-slate-500 dark:bg-slate-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {(wizardGroup.stats.completedRatio * 100).toFixed(1)}%
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Wizard Completion Ratio
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-amber-600 bg-amber-600/60 text-center text-white dark:border-amber-500 dark:bg-amber-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.totalBackSteps}
                              <span className="font-sans font-light"> &middot; </span>
                              {wizardGroup.stats.avgBackSteps.toFixed(1)}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Total and Average Back Steps
                            </span>
                          </div>

                          <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-rose-600 bg-rose-600/60 text-center text-white dark:border-rose-500 dark:bg-rose-500/40">
                            <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                              {wizardGroup.stats.totalErrors}
                              <span className="font-sans font-light"> &middot; </span>
                              {wizardGroup.stats.avgErrors.toFixed(1)}
                            </span>
                            <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                              Total and Average Errors
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm">
                            This score is calculated based on the amount of wizard errors, step errors and back to
                            previous step button clicks, where we deduct point to a wizard based on negative actions.
                          </p>
                          <Formula />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Inspect wizards view */}
                  {inspect ? (
                    <div className="flex gap-2">
                      <div className="flex-1 rounded bg-slate-100 text-gray-700">
                        <div className="flex items-center justify-between rounded-t border-b px-4 py-4">
                          <h4>{selectedWizard.component}</h4>
                          <span
                            className={classNames(
                              'flex gap-1 rounded border p-1.5 text-sm text-white',
                              selectedWizard.completed
                                ? 'border-teal-600 bg-teal-600/80'
                                : 'border-rose-600 bg-rose-600/80'
                            )}
                          >
                            {selectedWizard.completed ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5" />
                            )}
                            <span>{selectedWizard.completed ? 'Completed' : 'Abandoned'}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-b bg-slate-50 px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-x-2">
                              <span className="h-4 w-4 rounded-full bg-rose-600" />
                              <span className="whitespace-nowrap text-sm font-semibold">
                                Errors: <span className="font-normal">{selectedWizard.errorCount}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-x-2">
                              <span className="h-4 w-4 rounded-full bg-amber-600" />
                              <span className="whitespace-nowrap text-sm font-semibold">
                                Backs: <span className="font-normal">{selectedWizard.backStepCount}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-x-2">
                              <span className="h-4 w-4 rounded-full bg-blue-600" />
                              <span className="whitespace-nowrap text-sm font-semibold">
                                Timespan: <span className="font-normal">{selectedWizard.timespan.toFixed(1)}s</span>
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <CircularProgressBadge progress={selectedWizard.score} />
                              <span className="text-center text-xs tracking-tighter">UX Score</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wizard Scroll Buttons */}
                      <div className="flex flex-col">
                        <button
                          disabled={inspectIndex === 0}
                          onClick={() => setInspectIndex((idx) => idx - 1)}
                          className="group self-stretch rounded-t px-2 py-2 transition enabled:bg-slate-100 enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-20 dark:disabled:text-white"
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>

                        <span className="flex flex-1 items-center justify-center self-stretch bg-slate-100 px-2 py-2">
                          {inspectIndex}
                        </span>

                        <button
                          disabled={inspectIndex === wizardGroup.wizards.length - 1}
                          onClick={() => setInspectIndex((idx) => idx + 1)}
                          className="group self-stretch rounded-b px-2 py-2 transition enabled:bg-slate-100 enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-20 dark:disabled:text-white"
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Footer buttons */}
                  <div className="mt-8 flex items-center justify-end gap-3">
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
                      className="flex items-center gap-2 rounded bg-slate-500 px-4 py-2 text-sm text-white transition hover:opacity-80"
                      onClick={closeModal}
                    >
                      <span>Got it, thanks!</span>
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
                    className="mb-3 font-sans text-lg font-bold leading-6 text-slate-800 dark:text-white"
                  >
                    Wizard Scoring Approach
                  </Dialog.Title>

                  <div className="mt-2 font-normal text-gray-700 dark:text-white">
                    The score is a number between 0 and 100. This score is calculated based on the amount of{' '}
                    <strong>wizard errors</strong>, <strong>step errors</strong> and{' '}
                    <strong>back to previous step </strong> button clicks, where we deduct points to a wizard based on
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
    <code className="my-3 block bg-navy px-3 py-2 text-sm font-normal tracking-[-0.07rem] text-white dark:bg-slate-500 dark:text-white">
      wizardScore = max(0, 100 - 10*errors - 8*stepErrors - 5*backSteps - 3*cancels)
    </code>
  );
}
