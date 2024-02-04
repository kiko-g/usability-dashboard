import React, { Fragment } from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { Dialog, Listbox, Transition } from '@headlessui/react'
import type { ITrackerEventGroup, IWizardGroup, ScoringApproach } from '@/@types'
import { WizardStats, WizardStepCompletionStats, WizardErrorStatsType } from '@/@types/frontend'

import { Layout } from '@/components/layout'
import { WizardFormula } from '@/components/WizardFormula'
import { SelectFormula } from '@/components/SelectFormula'
import { CircularProgressBadge, Loading, NotFound } from '@/components/utils'

import { standardDeviation } from '@/utils'
import { mockWizardData as mockData } from '@/utils/mock'
import { WizardAction, evaluateAndGroupWizards } from '@/utils/matomo'

import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import {
  ArrowPathIcon,
  InformationCircleIcon,
  ChartPieIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  CircleStackIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XCircleIcon,
  ScaleIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/outline'

export default function Wizards() {
  const [error, setError] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [willFetch, setWillFetch] = React.useState<boolean>(true)

  const [rawData, setRawData] = React.useState<ITrackerEventGroup[]>([])
  const [processedData, setProcessedData] = React.useState<IWizardGroup[]>([])

  const scoringApproaches = ['A', 'B', 'C'] as ScoringApproach[]
  const [scoringApproach, setScoringApproach] = React.useState<ScoringApproach>('A')

  // fetch data
  React.useEffect(() => {
    if (!willFetch) {
      if (rawData.length > 0) {
        const evaluatedWizards = evaluateAndGroupWizards(mockData, scoringApproach)
        setProcessedData(evaluatedWizards)
      }
    } else {
      setError(false)
      setLoading(true)

      fetch('/api/matomo/events/wizard')
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText)
          }
          return res.json()
        })
        .then((data: ITrackerEventGroup[]) => {
          setLoading(false)
          setWillFetch(false)
          setRawData(data)
          const evaluatedWizards = evaluateAndGroupWizards(data, scoringApproach)
          setProcessedData(evaluatedWizards)
        })
        .catch((error) => {
          setError(true)
          setLoading(false)
          setRawData(mockData)
          setWillFetch(false)
          console.error(error)
        })
    }
  }, [willFetch, scoringApproach, rawData])

  return (
    <Layout location="Wizards">
      <article className="flex flex-col justify-center gap-1">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Wizard Insights</h1>
        <div className="mb-2 flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
          <p className="max-w-4xl grow text-lg font-normal">
            Inspect how your users are using the <span className="font-bold underline">wizards</span> across the
            platform.
          </p>

          {/* Header Buttons */}
          <div className="flex items-center gap-2">
            {/* Use mock data button */}
            {error === false || rawData !== null ? null : (
              <button
                title="Use mock data"
                className="hover:opacity-80"
                onClick={() => {
                  setError(false)
                  setRawData(mockData)
                  const processedDataResult = evaluateAndGroupWizards(mockData, scoringApproach)
                  setProcessedData(processedDataResult)
                }}
              >
                <CircleStackIcon className="h-6 w-6" />
              </button>
            )}

            {/* Choose Scoring Approach */}
            <SelectFormula
              scoringApproaches={scoringApproaches}
              scoringApproachHook={[scoringApproach, setScoringApproach]}
            />

            {/* Score information button */}
            <ScoreCalculcationApproachDialog scoringApproach={scoringApproach} />

            {/* API route source button */}
            <Link
              target="_blank"
              title="Inspect API route source"
              href="/api/matomo/events/wizard"
              className="hover:opacity-80"
            >
              <CodeBracketIcon className="h-6 w-6" />
            </Link>

            {/* View Raw JSON button */}
            <button
              title="View Raw JSON data"
              className="hover:opacity-80"
              onClick={() => {
                const jsonString = JSON.stringify(rawData)
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`
                window.open(dataUri, '_blank')
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
                const jsonString = JSON.stringify(processedData)
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`
                window.open(dataUri, '_blank')
              }}
            >
              <ScaleIcon className="h-6 w-6" />
            </button>

            {/* Reload button */}
            <button
              title="Retry fetching data"
              className="hover:opacity-80"
              onClick={() => {
                setError(false)
                setWillFetch(true)
              }}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <KPIs data={processedData} scoringApproach={scoringApproach} />
        {loading && <Loading />}
        {error && rawData === null && <NotFound />}
      </article>
    </Layout>
  )
}

function KPIs({ data, scoringApproach }: { data: IWizardGroup[]; scoringApproach: ScoringApproach }) {
  const stats = React.useMemo<WizardStats>(() => {
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
      }

    const completed = data.reduce((acc, item) => acc + item.stats.completed, 0)
    const notCompleted = data.reduce((acc, item) => acc + item.stats.notCompleted, 0)
    const total = completed + notCompleted

    const totalTime = data.reduce((acc, item) => acc + item.stats.avgTimespan * item.stats.total, 0)
    const totalCount = data.reduce((acc, item) => acc + item.stats.total, 0)

    const timespans = data.flatMap((item) => item.wizards.map((wizard) => wizard.timespan))
    const minTime = Math.min(...timespans)
    const maxTime = Math.max(...timespans)
    const avgTime = totalCount > 0 ? totalTime / totalCount : 0
    const stdDevTime = standardDeviation(timespans)

    const allScores = data.map((group) => group.wizards.map((w) => w.score)).flat()
    const allScoreNumbers = allScores.filter((score) => score !== null) as number[]

    const discarded = allScores.length - allScoreNumbers.length
    const cancelled = notCompleted - discarded

    const allScoresSum = allScoreNumbers.reduce((acc, score) => acc + score, 0)
    const avgScore = allScoresSum === 0 ? null : allScoresSum / allScoreNumbers.length

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
    }
  }, [data])

  const stepStats = React.useMemo<WizardStepCompletionStats>(() => {
    let activatedStepsTotal = 0
    let successStepsTotal = 0
    let failedStepTotal = 0
    let minSuccessfulStepTime = Infinity
    let maxSuccessfulStepTime = 0
    let totalSuccessfulStepTime = 0
    let successfulStepCount = 0
    let successfulStepTimes: number[] = []

    data.forEach((wizardGroup) => {
      wizardGroup.wizards.forEach((wizard) => {
        let isStepActivated = false
        let activatedTime: number | null = null

        wizard.events.forEach((event) => {
          const action = event.action
          if (action.includes(WizardAction.ActivateStep)) {
            isStepActivated = true
            activatedTime = new Date(event.time).getTime()
            activatedStepsTotal++
          } else if (action.includes(WizardAction.SuccessStep) && isStepActivated) {
            if (activatedTime !== null) {
              const successTime = new Date(event.time).getTime()
              const stepTime = (successTime - activatedTime) / 1000 // convert to seconds
              successfulStepTimes.push(stepTime)
              totalSuccessfulStepTime += stepTime
              successfulStepCount++
              minSuccessfulStepTime = Math.min(minSuccessfulStepTime, stepTime)
              maxSuccessfulStepTime = Math.max(maxSuccessfulStepTime, stepTime)
              activatedTime = null
            }
            isStepActivated = false
            successStepsTotal++
          } else if (action.includes(WizardAction.FailStep)) {
            failedStepTotal++
            isStepActivated = false
          }
        })
      })
    })

    const avgSuccessfulStepTime = successfulStepCount > 0 ? totalSuccessfulStepTime / successfulStepCount : 0
    const stdDevSuccessfulStepTime = standardDeviation(successfulStepTimes)

    return {
      activated: activatedStepsTotal,
      successful: successStepsTotal,
      failed: failedStepTotal,
      minSuccessfulStepTime,
      maxSuccessfulStepTime,
      avgSuccessfulStepTime,
      stdDevSuccessfulStepTime,
    }
  }, [data])

  const negativeStats = React.useMemo<WizardErrorStatsType>(() => {
    let totalWizards = 0
    let backStepCount = 0
    let errorCount = 0
    let failedStepCount = 0
    let totalErrors = 0
    let totalFailedSteps = 0
    let totalBackSteps = 0

    data.forEach((item) => {
      item.wizards.forEach((wizard) => {
        totalWizards++
        totalErrors += wizard.errorCount
        totalFailedSteps += wizard.failedStepCount
        totalBackSteps += wizard.backStepCount

        if (wizard.errorCount > 0) errorCount++
        if (wizard.backStepCount > 0) backStepCount++
        if (wizard.failedStepCount > 0) failedStepCount++
      })
    })

    const avgError = errorCount > 0 ? totalErrors / totalWizards : 0
    const avgBack = backStepCount > 0 ? totalBackSteps / totalWizards : 0
    const avgFailedSteps = failedStepCount > 0 ? totalFailedSteps / totalWizards : 0

    return { totalErrors, totalFailedSteps, totalBackSteps, avgError, avgFailedSteps, avgBack }
  }, [data])

  if (data.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 self-stretch xl:flex-row">
        <WizardAverageUXScoreCard stats={stats} scoringApproach={scoringApproach} />
        <WizardCompletionRateCard stats={stats} />

        <div className="flex flex-1 flex-col items-start justify-start gap-4 self-stretch">
          <GeneralStatsCard stats={stats} />
          <StepCompletionStatsCard stats={stepStats} />
          <ErrorStatsCard stats={negativeStats} />
        </div>
      </div>
      <WizardSortedList data={data} scoringApproach={scoringApproach} />
    </div>
  )
}

function WizardCompletionRateCard({ stats }: { stats: WizardStats }) {
  const { completedRatio, completed, notCompleted } = stats
  const progress = Math.min(Math.max(completedRatio, 0), 1) * 100
  const diameter = 120 // Adjusted diameter value
  const strokeWidth = 7 // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative max-w-full rounded bg-white/80 p-4 dark:bg-white/10 xl:max-w-xs">
      {/* Adjusted max-w value */}
      <h3 className="font-medium text-gray-700 dark:text-gray-100">Wizard Completion Rate</h3>
      <p className="mt-1 min-h-[5rem] text-sm">
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
            {completed}/{completed + notCompleted}
          </span>
        </div>
      </div>
    </div>
  )
}

function WizardAverageUXScoreCard({
  stats,
  scoringApproach,
}: {
  stats: WizardStats
  scoringApproach: ScoringApproach
}) {
  const diameter = 120 // Adjusted diameter value
  const strokeWidth = 7 // Adjusted strokeWidth value
  const radius = (diameter - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = stats.avgScore === null ? circumference : circumference - (stats.avgScore / 100) * circumference

  return (
    <div className="relative max-w-full rounded bg-white/80 p-4 dark:bg-white/10 xl:max-w-xs">
      <div className="flex items-center gap-1.5">
        <h3 className="font-medium text-gray-700 dark:text-gray-100">Wizard Average UX Score</h3>
        <ScoreCalculcationApproachDialog
          content={<InformationCircleIcon className="h-5 w-5" />}
          scoringApproach={scoringApproach}
        />
      </div>

      <p className="mt-1 min-h-[5rem] text-sm">
        Average of the usability score given to all the{' '}
        <strong className="underline decoration-blue-500">{stats.total - stats.discarded} non discarded</strong>{' '}
        wizards, according to <strong className="underline decoration-blue-500">formula {scoringApproach}</strong>.
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
          <span className="text-4xl font-bold">{stats.avgScore === null ? 'N/A' : stats.avgScore.toFixed(1)}</span>
          <span className="text-xl">out of 100</span>
        </div>
      </div>
    </div>
  )
}

function GeneralStatsCard({ stats }: { stats: WizardStats }) {
  const { avgTime, minTime, maxTime, stdDevTime, cancelled, discarded, total, completed } = stats
  const completedRatio = ((100 * completed) / total).toFixed(1)
  const discardedRatio = ((100 * discarded) / total).toFixed(1)
  const cancelledRatio = ((100 * cancelled) / total).toFixed(1)

  return (
    <div className="relative self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Wizard General Stats</h2>
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
            Avg Time to complete wizard: <span className="font-normal">{avgTime.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-pink-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Min Time to complete wizard: <span className="font-normal">{minTime.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-violet-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Max Time to complete wizard: <span className="font-normal">{maxTime.toFixed(2)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-lime-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Std Dev for completed wizard times:{' '}
            <span className="font-normal">{stdDevTime === null ? 'N/A' : `${stdDevTime.toFixed(2)}s`}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function StepCompletionStatsCard({ stats }: { stats: WizardStepCompletionStats }) {
  const {
    activated,
    successful,
    failed,
    minSuccessfulStepTime,
    maxSuccessfulStepTime,
    avgSuccessfulStepTime,
    stdDevSuccessfulStepTime,
  } = stats

  const cancelled = activated - successful - failed
  const failedRatio = ((100 * failed) / activated).toFixed(1)
  const successfulRatio = ((100 * successful) / activated).toFixed(1)
  const cancelledRatio = ((100 * cancelled) / activated).toFixed(1)

  return (
    <div className="relative self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Step Completion Stats</h2>
      <div className="grid w-full grid-cols-1 grid-rows-none gap-x-0 xl:w-min xl:grid-flow-col xl:grid-cols-none xl:grid-rows-4 xl:gap-x-4">
        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-gray-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            All activated steps: <span className="font-normal">{activated}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-emerald-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Successful steps:{' '}
            <span className="font-normal">
              {successful} ({successfulRatio}%)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-orange-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Cancelled steps:{' '}
            <span className="font-normal">
              {cancelled} ({cancelledRatio}%)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-rose-600" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Failed steps:{' '}
            <span className="font-normal">
              {failed} ({failedRatio}%)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-blue-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg time to complete step: <span className="font-normal">{avgSuccessfulStepTime.toFixed(1)}s</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-pink-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Min time to complete step:{' '}
            <span className="font-normal">
              {minSuccessfulStepTime === Infinity ? 'N/A' : `${minSuccessfulStepTime}s`}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-violet-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Max time to complete step:{' '}
            <span className="font-normal">{maxSuccessfulStepTime < 0 ? 'N/A' : `${maxSuccessfulStepTime}s`}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-lime-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Std Dev for completed step times:{' '}
            <span className="font-normal">
              {stdDevSuccessfulStepTime === null ? 'N/A' : `${stdDevSuccessfulStepTime.toFixed(1)}s`}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

function ErrorStatsCard({ stats }: { stats: WizardErrorStatsType }) {
  const { totalErrors, totalFailedSteps, totalBackSteps, avgError, avgBack, avgFailedSteps } = stats

  return (
    <div className="relative self-stretch rounded bg-white/80 p-4 dark:bg-white/10">
      <h2 className="mb-2 text-xl font-bold">Negative Actions Stats</h2>
      <div className="grid w-full grid-cols-1 grid-rows-none gap-x-0 xl:w-min xl:grid-flow-col xl:grid-cols-none xl:grid-rows-3 xl:gap-x-4">
        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-amber-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total Backs: <span className="font-normal">{totalBackSteps}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-orange-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total Errors: <span className="font-normal">{totalErrors}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-rose-600" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Total Failed Steps: <span className="font-normal">{totalFailedSteps}</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-amber-400" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Backs: <span className="font-normal">{avgBack.toFixed(2)} p/ wizard</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-orange-500" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Errors: <span className="font-normal">{avgError.toFixed(2)} p/ wizard</span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="h-4 w-4 rounded-full bg-rose-600" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tighter">
            Avg Failed Steps: <span className="font-normal">{avgFailedSteps.toFixed(2)} p/ wizard</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function WizardSortedList({ data, scoringApproach }: { data: IWizardGroup[]; scoringApproach: ScoringApproach }) {
  const options = [
    'Alphabetic (A to Z)',
    'Alphabetic (Z to A)',
    'Low Score First',
    'High Score First',
    'Low Completion First',
    'High Completion First',
    'Low Frequency First',
    'High Frequency First',
  ]

  const getSortFunction = (picked: any) => {
    switch (picked) {
      case 'Alphabetic (A to Z)':
        return (a: IWizardGroup, b: IWizardGroup) => a.name.localeCompare(b.name)
      case 'Alphabetic (Z to A)':
        return (a: IWizardGroup, b: IWizardGroup) => b.name.localeCompare(a.name)
      case 'Low Score First':
        return (a: IWizardGroup, b: IWizardGroup) => {
          if (a.stats.avgScore === null && b.stats.avgScore === null) return 0
          if (a.stats.avgScore === null) return 1
          if (b.stats.avgScore === null) return -1
          return a.stats.avgScore < b.stats.avgScore ? -1 : 1
        }
      case 'High Score First':
        return (a: IWizardGroup, b: IWizardGroup) => {
          if (a.stats.avgScore === null && b.stats.avgScore === null) return 0
          if (a.stats.avgScore === null) return 1
          if (b.stats.avgScore === null) return -1
          return a.stats.avgScore > b.stats.avgScore ? -1 : 1
        }
      case 'Low Completion First':
        return (a: IWizardGroup, b: IWizardGroup) => a.stats.completedRatio - b.stats.completedRatio
      case 'High Completion First':
        return (a: IWizardGroup, b: IWizardGroup) => b.stats.completedRatio - a.stats.completedRatio
      case 'Low Frequency First':
        return (a: IWizardGroup, b: IWizardGroup) => a.stats.total - b.stats.total
      case 'High Frequency First':
        return (a: IWizardGroup, b: IWizardGroup) => b.stats.total - a.stats.total
      default:
        return (a: IWizardGroup, b: IWizardGroup) => a.name.localeCompare(b.name)
    }
  }

  const [picked, setPicked] = React.useState(options[2])
  const sortedData = React.useMemo(() => {
    const sortFunction = getSortFunction(picked)
    return [...data].sort(sortFunction)
  }, [data, picked])

  return (
    <div className="relative w-full rounded bg-white/80 p-4 dark:bg-white/10">
      <div className="mb-4 flex w-full flex-col items-center justify-between gap-1 xl:mb-3 xl:flex-row xl:gap-2">
        <h2 className="mb-2 w-full text-center text-sm font-bold tracking-tighter xl:text-left xl:text-xl xl:tracking-normal">
          Wizards Sorted by <span className="underline">{picked}</span>
        </h2>
        <div className="w-full xl:w-auto">
          <Listbox value={picked} onChange={setPicked}>
            <div className="relative w-full min-w-full xl:w-auto xl:min-w-[15rem]">
              <Listbox.Button
                as="button"
                className="inline-flex w-full items-center justify-center gap-x-1 rounded border border-primary bg-primary/50 py-2 pl-3 pr-2 text-center text-sm font-medium tracking-tight text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary dark:bg-secondary/50 dark:hover:bg-secondary/80 xl:px-2 xl:py-1.5"
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
                <Listbox.Options className="absolute mt-2 w-full overflow-auto rounded border border-gray-300 bg-gray-100 py-2 shadow xl:w-full">
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
        </div>
      </div>

      <ul className="flex flex-col gap-y-2 xl:gap-y-3">
        {/* Wizard List Banner */}
        <li className="flex flex-col items-center justify-between gap-2 rounded bg-primary px-2 py-2 text-xs font-normal tracking-tighter dark:bg-secondary xl:flex-row xl:px-4 xl:py-3 xl:text-xs xl:font-medium">
          <span className="lg:left w-full rounded text-center font-lexend text-sm font-medium text-white xl:w-auto">
            Wizard Name
          </span>
          <span className="flex flex-wrap items-center justify-center gap-2 text-center text-[0.65rem] font-normal xl:gap-2 xl:text-[0.65rem] xl:font-medium">
            <span
              title="Average Number of Errors"
              className="flex h-auto w-auto items-center justify-center whitespace-pre-wrap rounded border border-rose-500 bg-rose-500/70 p-1 text-white group-hover:bg-rose-500 xl:h-12 xl:w-10"
            >
              Avg Fails
            </span>

            <span
              title="Average Number of Errors"
              className="flex h-auto w-auto items-center justify-center rounded border border-orange-500 bg-orange-500/70 p-1 text-white group-hover:bg-orange-500 xl:h-12 xl:w-10"
            >
              Avg Errors
            </span>
            <span
              title="Average Number of Back to Previous Step Clicks"
              className="flex h-auto w-auto items-center justify-center rounded border border-amber-400 bg-amber-400/70 p-1 text-white group-hover:bg-amber-400 xl:h-12 xl:w-10"
            >
              Avg Backs
            </span>
            <span
              title="Average Completed Ratio"
              className="flex h-auto w-auto items-center justify-center rounded border border-emerald-500 bg-emerald-500/70 p-1 text-white group-hover:bg-emerald-500 xl:h-12 xl:w-10"
            >
              Avg Rate
            </span>
            <span
              title="Average UX Score"
              className="flex h-auto w-auto items-center justify-center rounded border border-blue-600 bg-blue-600/70 p-1 text-white group-hover:bg-blue-600 xl:h-12 xl:w-10"
            >
              Avg Score
            </span>
            <span
              title="Total Wizards Opened"
              className="flex h-auto w-auto items-center justify-center rounded border border-gray-100 bg-gray-100/70 p-1 text-gray-800 group-hover:bg-gray-100 dark:border-gray-200 dark:bg-gray-200/70 dark:group-hover:bg-gray-200 xl:h-12 xl:w-10"
            >
              Total Wizards
            </span>
          </span>
        </li>

        {/* Wizard List */}
        {sortedData.map((wizardGroup, wizardGroupIdx) => (
          <li key={wizardGroupIdx}>
            <WizardGroupFocus wizardGroup={wizardGroup} scoringApproach={scoringApproach} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function WizardGroupFocus({
  wizardGroup,
  scoringApproach,
}: {
  wizardGroup: IWizardGroup
  scoringApproach: ScoringApproach
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inspect, setInspect] = React.useState(true)
  const [textView, setTextView] = React.useState(false)
  const [inspectIndex, setInspectIndex] = React.useState(0)
  const selectedWizard = React.useMemo(
    () => (wizardGroup.wizards[inspectIndex] ? wizardGroup.wizards[inspectIndex] : null),
    [wizardGroup, inspectIndex]
  )
  const stepCompletionRatio = React.useMemo(() => {
    if (!selectedWizard) return 0

    const completed = selectedWizard.completed
    const stepsDone = selectedWizard.stepStatus.current + (completed ? 1 : 0)
    const visibleSteps = selectedWizard.stepStatus.visible

    return 100 * (stepsDone / visibleSteps)
  }, [selectedWizard])

  const { avgError, avgBack } = React.useMemo(() => {
    const totalWizards = wizardGroup.wizards.length
    const totalErrors = wizardGroup.stats.totalErrors
    const totalBackSteps = wizardGroup.stats.totalBackSteps

    const avgError = totalErrors > 0 ? totalErrors / totalWizards : 0
    const avgBack = totalBackSteps > 0 ? totalBackSteps / totalWizards : 0

    return { avgError, avgBack }
  }, [wizardGroup])

  const wizardGroupDiscards = wizardGroup.wizards.reduce((acc, w) => acc + (w.discarded ? 1 : 0), 0)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="group flex w-full flex-col items-center justify-between gap-2 rounded border border-primary bg-primary/70 px-2 py-2 text-white transition hover:bg-primary/90 dark:border-secondary dark:bg-secondary/30 dark:hover:bg-secondary/80 xl:flex-row xl:px-4 xl:py-2.5"
      >
        <span className="flex items-center justify-between gap-1.5 text-xs font-normal xl:text-sm xl:font-medium">
          <span className="text-left tracking-tighter xl:tracking-normal">{wizardGroup.name}</span>
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </span>
        <span className="flex flex-wrap items-center justify-center gap-1 text-[0.60rem] font-normal xl:gap-2 xl:text-xs xl:font-medium">
          <span
            title="Average Number of Errors"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-500 bg-rose-500/70 text-white group-hover:bg-rose-500 xl:h-10 xl:w-10"
          >
            {wizardGroup.stats.avgFailedSteps.toFixed(1)}
          </span>
          <span
            title="Average Number of Back to Previous Step Clicks"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-500 bg-orange-500/70 text-white group-hover:bg-orange-500 xl:h-10 xl:w-10"
          >
            {wizardGroup.stats.avgErrors.toFixed(1)}
          </span>
          <span
            title="Average Number of Back to Previous Step Clicks"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400 bg-amber-400/70 text-white group-hover:bg-amber-400 xl:h-10 xl:w-10"
          >
            {wizardGroup.stats.avgBackSteps.toFixed(1)}
          </span>
          <span
            title="Average Completed Ratio"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500/70 text-white group-hover:bg-emerald-500 xl:h-10 xl:w-10"
          >
            {(wizardGroup.stats.completedRatio * 100).toFixed(0)}%
          </span>
          <span
            title="Average UX Score"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-600 bg-blue-600/70 text-white group-hover:bg-blue-600 xl:h-10 xl:w-10"
          >
            {wizardGroup.stats.avgScore === null ? 'N/A' : wizardGroup.stats.avgScore.toFixed(1)}
          </span>
          <span
            title="Total Wizards Opened"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-gray-100/70 text-gray-800 group-hover:bg-gray-100 dark:border-gray-200 dark:bg-gray-200/70 dark:group-hover:bg-gray-200 xl:h-10 xl:w-10"
          >
            {wizardGroup.stats.total}
          </span>
        </span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                <Dialog.Panel className="flex h-screen w-full transform flex-col justify-between gap-4 overflow-scroll bg-white p-5 text-left align-middle shadow-xl transition-all dark:bg-navy md:min-w-[36rem] md:max-w-3xl">
                  <div className="flex flex-col items-start justify-center font-normal text-gray-700 dark:text-white">
                    <div className="flex w-full items-center justify-between gap-2">
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-800 dark:text-white">
                        <strong>Wizard:</strong> <span className="underline">{wizardGroup.name}</span>
                      </Dialog.Title>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTextView((prev) => !prev)}
                          className="transition hover:scale-125 hover:opacity-50"
                        >
                          <span className="sr-only">Toggle view mode</span>
                          {textView ? <ChartPieIcon className="h-6 w-6" /> : <DocumentTextIcon className="h-6 w-6" />}
                        </button>
                        <button
                          onClick={closeModal}
                          className="text-teal-500 transition hover:scale-125 hover:opacity-50"
                        >
                          <span className="sr-only">Close modal</span>
                          <CheckCircleSolidIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm">Here are some key stats for wizards of this category</p>

                    {/* KPIs */}
                    {textView ? (
                      // Text view
                      <ul className="mb-2 mt-1 flex w-full list-inside list-disc flex-col gap-1 text-sm text-gray-600 dark:text-gray-200">
                        <li>
                          The <span className="underline">average time spent</span> on this wizard type is{' '}
                          <strong>{wizardGroup.stats.avgTimespan}s</strong>.{' '}
                          {wizardGroup.stats.stdDevTimespan === null ? (
                            <>
                              <span className="underline">Standard deviation analysis</span> is not available because we
                              don&apos;t have 2 or more wizards.
                            </>
                          ) : (
                            <>
                              The standard deviation of time spent on this kind of wizard is{' '}
                              <strong>{wizardGroup.stats.stdDevTimespan.toFixed(2)}s</strong>
                            </>
                          )}
                        </li>

                        <li>
                          A total of <strong>{wizardGroup.stats.total} wizards were initiated</strong>,{' '}
                          {wizardGroup.stats.completed} were completed, and {wizardGroup.stats.notCompleted} were
                          cancelled/aborted, meaning that{' '}
                          <strong>
                            {(wizardGroup.stats.completedRatio * 100).toFixed(2)}% of wizards were completed
                          </strong>
                          .
                        </li>

                        <li>
                          Data was collected for <strong>{wizardGroup.wizards.length} wizard(s)</strong> of this
                          category. There were a total of <strong>{wizardGroup.stats.totalErrors} error(s)</strong>{' '}
                          across these, alongside a total of{' '}
                          <strong>{wizardGroup.stats.totalBackSteps} back to previous step click(s)</strong>. This means
                          that on average, each wizard had <strong>{avgError.toFixed(1)} errors</strong> and{' '}
                          <strong>{avgBack.toFixed(1)} back steps</strong>.{' '}
                          {wizardGroup.stats.stdDevScore === null ? (
                            <>
                              <span className="underline">Standard deviation analysis</span> for UX Score is not
                              available because we don&apos;t have 2 or more wizards.
                            </>
                          ) : (
                            <>
                              The standard deviation of UX Score on this kind of wizard is{' '}
                              <strong>{wizardGroup.stats.stdDevScore.toFixed(2)}</strong>
                            </>
                          )}
                        </li>

                        <li>
                          The average score was{' '}
                          <strong>
                            {wizardGroup.stats.avgScore === null ? 'N/A' : wizardGroup.stats.avgScore.toFixed(2)} out of
                            a possible 100 points
                          </strong>
                        </li>
                      </ul>
                    ) : (
                      // Card Views
                      <div className="mx-auto mb-3 mt-2 grid w-auto grid-cols-2 gap-x-3 gap-y-3 xl:grid-cols-5">
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

                        <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-gray-600 bg-gray-600/60 text-center text-white dark:border-gray-500 dark:bg-gray-500/40">
                          <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                            {wizardGroup.stats.total}
                            <span className="font-sans font-light"> &middot; </span>
                            {(wizardGroup.stats.completedRatio * 100).toFixed(1)}%
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Initiated vs. Completion Ratio
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
                            {wizardGroupDiscards}
                            <span className="font-sans font-light"> &middot; </span>
                            {wizardGroup.stats.notCompleted - wizardGroupDiscards}
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Discarded or Cancelled
                          </span>
                        </div>

                        <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-violet-600 bg-violet-600/60 text-center text-white dark:border-violet-500 dark:bg-violet-500/40">
                          <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                            {wizardGroup.stats.avgScore === null
                              ? 'N/A'
                              : `${wizardGroup.stats.avgScore.toFixed(1)}/100`}
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Average Wizard UX Score
                          </span>
                        </div>

                        <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-violet-600 bg-violet-600/60 text-center text-white dark:border-violet-500 dark:bg-violet-500/40">
                          <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                            {wizardGroup.stats.stdDevScore === null ? 'N/A' : wizardGroup.stats.stdDevScore.toFixed(1)}
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Std Dev for Wizard UX Score
                          </span>
                        </div>

                        <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-amber-600 bg-amber-600/50 text-center text-white dark:border-amber-500 dark:bg-amber-500/40">
                          <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                            {wizardGroup.stats.totalBackSteps}
                            <span className="font-sans font-light"> &middot; </span>
                            {wizardGroup.stats.avgBackSteps.toFixed(1)}
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Total and Avg Back Steps
                          </span>
                        </div>

                        <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-orange-600 bg-orange-600/60 text-center text-white dark:border-orange-600 dark:bg-orange-600/40">
                          <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                            {wizardGroup.stats.totalErrors}
                            <span className="font-sans font-light"> &middot; </span>
                            {wizardGroup.stats.avgErrors.toFixed(1)}
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Total and Avg Failed Steps
                          </span>
                        </div>

                        <div className="flex w-full max-w-[8rem] flex-col items-center justify-center rounded-xl border border-rose-600 bg-rose-600/60 text-center text-white dark:border-rose-500 dark:bg-rose-500/40">
                          <span className="w-full border-b px-2 py-2 font-mono text-xl font-bold">
                            {wizardGroup.stats.totalFailedSteps}
                            <span className="font-sans font-light"> &middot; </span>
                            {wizardGroup.stats.avgFailedSteps.toFixed(1)}
                          </span>
                          <span className="my-auto flex min-h-[51px] items-center px-2 py-2 text-sm leading-tight tracking-tighter">
                            Total and Avg Errors
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Inspect wizards view */}
                    {inspect && selectedWizard !== null ? (
                      <div className="flex w-full gap-2 xl:gap-4">
                        {/* Wizard Inspect Card */}
                        <div className="flex-1 rounded-xl bg-navy text-white dark:bg-white/10">
                          <div className="flex items-center justify-between rounded-t border-b px-2 py-2 xl:px-3 xl:py-3">
                            <div className="flex flex-col">
                              <h4 className="tracking-[-0.08rem] xl:tracking-normal">{selectedWizard.component}</h4>
                              <span className="text-xxs">score = {selectedWizard.formulaStr}</span>
                            </div>
                            <span
                              className={classNames(
                                'flex gap-1 rounded-full border p-1 text-sm text-white xl:rounded xl:p-1.5',
                                selectedWizard.completed
                                  ? 'border-teal-600 bg-teal-600/80'
                                  : selectedWizard.discarded
                                  ? 'border-orange-400 bg-orange-400/80'
                                  : 'border-rose-600 bg-rose-600/80'
                              )}
                            >
                              {selectedWizard.completed ? (
                                <CheckCircleSolidIcon className="h-5 w-5" />
                              ) : (
                                <XCircleIcon className="h-5 w-5" />
                              )}
                              <span className="hidden xl:flex">
                                {selectedWizard.completed
                                  ? 'Completed'
                                  : selectedWizard.discarded
                                  ? 'Discarded'
                                  : 'Cancelled'}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between rounded-b px-2 py-2 xl:px-3 xl:py-3">
                            <div className="grid grid-cols-1 grid-rows-none gap-y-0 xl:grid-flow-col xl:grid-cols-none xl:grid-rows-4 xl:gap-x-6">
                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-blue-600" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Timespan: <span className="font-normal">{selectedWizard.timespan.toFixed(1)}s</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-emerald-500" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Last Step Started:{' '}
                                  <span className="font-normal">{selectedWizard.stepStatus.current + 1}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-pink-500" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Visible Steps:{' '}
                                  <span className="font-normal">{selectedWizard.stepStatus.visible}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-violet-500" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Max Possible Steps:{' '}
                                  <span className="font-normal">{selectedWizard.stepStatus.total}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-amber-500" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Backs: <span className="font-normal">{selectedWizard.backStepCount}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-orange-500" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Errors: <span className="font-normal">{selectedWizard.errorCount}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-x-2">
                                <span className="h-4 w-4 rounded-full bg-rose-600" />
                                <span className="whitespace-nowrap text-sm tracking-tighter xl:tracking-normal">
                                  Failed Steps: <span className="font-normal">{selectedWizard.failedStepCount}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-x-0 gap-y-3 xl:flex-row xl:gap-x-3 xl:gap-y-0">
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <CircularProgressBadge
                                  progress={stepCompletionRatio}
                                  color={selectedWizard.completed ? 'green' : 'red'}
                                />
                                <span className="text-center text-xs tracking-tighter">
                                  Step{' '}
                                  {selectedWizard.completed
                                    ? selectedWizard.stepStatus.current + 1
                                    : selectedWizard.stepStatus.current}
                                  /{selectedWizard.stepStatus.visible}
                                </span>
                              </div>

                              <div className="flex flex-col items-center justify-center space-y-1">
                                <CircularProgressBadge progress={selectedWizard.score} color="blue" />
                                <span className="text-center text-xs tracking-tighter">UX Score</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wizard Scroll Buttons */}
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
                            disabled={inspectIndex === wizardGroup.wizards.length - 1}
                            onClick={() => setInspectIndex((idx) => idx + 1)}
                            className="group self-stretch rounded-b-xl px-2 py-2 transition enabled:hover:bg-sky-600/50 disabled:cursor-not-allowed disabled:opacity-20 dark:disabled:text-white"
                          >
                            <ChevronDownIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <WizardFormula formula={scoringApproach} />
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
                        <CheckCircleSolidIcon className="h-5 w-5" />
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
  )
}

function ScoreCalculcationApproachDialog({
  content,
  scoringApproach,
}: {
  content?: any
  scoringApproach: ScoringApproach
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button type="button" onClick={openModal} className="underline hover:opacity-80">
        {content ? content : <InformationCircleIcon className="h-6 w-6" />}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                <Dialog.Panel className="flex h-screen w-full transform flex-col justify-between gap-4 overflow-scroll bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-navy md:min-w-[36rem] md:max-w-3xl">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="mb-3 font-sans text-lg font-bold leading-6 text-gray-800 dark:text-white"
                    >
                      Wizard Scoring Approach <span className="font-normal">(Formula {scoringApproach})</span>
                    </Dialog.Title>

                    <WizardFormula formula={scoringApproach} />
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
  )
}
