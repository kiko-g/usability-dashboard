import { ScoringApproach } from '@/@types';
import { CodeBlock } from '@/components/utils';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

type Props = {
  formula?: ScoringApproach;
};

export function ExecutionViewFormula({ formula = 'A' }: Props) {
  if (formula === 'A') {
    return (
      <div className="mb-1 mt-2 text-sm leading-normal tracking-tight text-gray-700 dark:text-white">
        <p>
          The score is calculated based on <strong>whether the execution view was completed</strong> the amount of{' '}
          <strong>execution view errors</strong>, <strong>failed tabs</strong> and{' '}
          <strong>change tab button clicks</strong>. We deduct point to a execution view based on negative actions. If
          there are no negative actions and the timespan was under 10 seconds assume that the user was{' '}
          <span className="font-bold underline decoration-amber-400">
            not evidently attempting to complete the execution view
          </span>
          . Therefore we do not provide a score:
        </p>
        <CodeBlock>score = null</CodeBlock>

        <p>
          Otherwise, we start by establishing a baseline score (notice that we need the intermediate calculation for
          execessive tab changes):
        </p>
        <CodeBlock>
          excessiveTabChangeCount = tabChangeCount &ge; totalTabs ? (tabChangeCount - totalTabs - 1) : 0
        </CodeBlock>
        <CodeBlock>score = 100 - 15*failedTabs - 10*errors - 5*excessiveTabChangeCount</CodeBlock>

        <p>
          If the <span className="font-bold underline decoration-rose-500">execution view was cancelled/abandoned</span>{' '}
          we deduct extra points. We deduct <span className="font-bold underline decoration-rose-500">20 points</span>,
          extra points for the <span className="font-bold underline decoration-rose-500">negative actions</span> and for
          the <span className="font-bold underline decoration-rose-500">elapsed time</span> (1.0 points per 6 seconds):
        </p>
        <CodeBlock>score = score - 20 - 3*(errors + tabErrors + excessiveTabChangeCount) - timespan/6</CodeBlock>

        <p>
          The <span className="font-bold underline decoration-rose-500">minimum score is 0</span>, so if the score drops
          below that, we assign it a score of 0. In case the score is below 40 and the execution view was completed, we{' '}
          <span className="font-bold underline decoration-emerald-500">assign a score of 40</span> to the execution
          view, rewarding the completion.
        </p>
      </div>
    );
  } else
    return (
      <div className="mb-1 mt-2 flex items-center gap-2 text-gray-700 dark:text-white">
        <ShieldExclamationIcon className="h-5 w-5" />
        <p>
          Formula <strong>{formula}</strong> is unavailable.
        </p>
      </div>
    );
}
