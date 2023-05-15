import React, { Fragment } from 'react';
import type { IWizardGroup } from '../@types';
import { mockWizardData } from '../utils/mock';
import { Layout } from '../components/layout';
import { Loading, NotFound } from '../components/utils';
import { ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

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

    const completed = data.reduce((acc, item) => acc + item.completed, 0);
    const notCompleted = data.reduce((acc, item) => acc + item.notCompleted, 0);
    const total = completed + notCompleted;

    return {
      completed: completed,
      notCompleted: notCompleted,
      ratio: total > 0 ? completed / total : 0,
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

  // calculate average, minimum and maximum error and back step considering all wizards
  const errorAndBackStepStats = React.useMemo(() => {
    let totalErrors = 0;
    let totalBackSteps = 0;
    let errorCount = 0;
    let backStepCount = 0;

    data.forEach((item) => {
      item.wizards.forEach((wizard) => {
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

    const avgError = errorCount > 0 ? totalErrors / errorCount : 0;
    const avgBack = backStepCount > 0 ? totalBackSteps / backStepCount : 0;

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
      <div className="flex flex-1 gap-4 self-stretch">
        {completionRate === null ? null : <WizardCompletionRateCard completion={completionRate} />}
        {avgScore === null ? null : <WizardAverageUXScoreCard score={avgScore} />}
        <div className="flex flex-1 flex-col items-start justify-start gap-4 self-stretch">
          <TimeStatsCard text="Wizard Time Stats" stats={wizardTimeStats} />
          <TimeStatsCard text="Step Time Stats" stats={stepTimeStats} />
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

type AvgMinMax = {
  avg: number;
  min: number;
  max: number;
};

const TimeStatsCard = ({ stats, text }: { text: string; stats: AvgMinMax }) => {
  const { avg, min, max } = stats;

  return (
    <div className="relative flex flex-1 flex-col self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">{text}</h2>
      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-cyan-500" />
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
};

type ErrorStatsCard = {
  avgError: number;
  totalErrors: number;
  avgBack: number;
  totalBackSteps: number;
};

const ErrorStatsCard = ({ text, stats }: { text: string; stats: ErrorStatsCard }) => {
  const { avgError, totalErrors, avgBack, totalBackSteps } = stats;

  return (
    <div className="relative flex flex-1 flex-col self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">{text}</h2>
      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-cyan-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average Errors: <span className="font-normal">{avgError.toFixed(2)}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-pink-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Average Backs: <span className="font-normal">{avgBack.toFixed(2)}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-violet-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Total Errors: <span className="font-normal">{totalErrors}</span>
        </span>
      </div>

      <div className="flex items-center gap-x-2">
        <span className="h-4 w-4 rounded-full bg-teal-500" />
        <span className="whitespace-nowrap text-sm font-semibold">
          Total Backs: <span className="font-normal">{totalBackSteps}</span>
        </span>
      </div>
    </div>
  );
};

function WizardSortedList({ data }: { data: IWizardGroup[] }) {
  return (
    <div className="relative w-full rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Sorted Wizards by Low Score</h2>
      <ul className="flex flex-col gap-y-3">
        {data.map((wizardGroup, wizardGroupIdx) => (
          <li key={wizardGroupIdx} className="flex items-center gap-x-2">
            <WizardGroupFocus wizardGroup={wizardGroup} />{' '}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WizardGroupFocus({ wizardGroup }: { wizardGroup: IWizardGroup }) {
  let [isOpen, setIsOpen] = React.useState(true);

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
        className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Open dialog
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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Payment successful
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Your payment has been successfully submitted. We’ve sent you an email with all of the details of
                      your order.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Got it, thanks!
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
