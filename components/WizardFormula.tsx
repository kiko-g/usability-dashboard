import { ScoringApproach } from '@/@types';
import { CodeBlock } from '@/components/utils';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

type Props = {
  formula?: ScoringApproach;
};

export function WizardFormula({ formula = 'A' }: Props) {
  if (formula === 'A') {
    return (
      <div className="mb-1 mt-2 text-sm leading-normal tracking-tight text-gray-700 dark:text-white">
        <p>
          The score is calculated based on <strong>whether the wizard was completed</strong> the amount of{' '}
          <strong>wizard errors</strong>, <strong>failed steps</strong> and{' '}
          <strong>back to previous step button clicks</strong>. We deduct point to a wizard based on negative actions.
          If there are no negative actions and the timespan was under 10 seconds assume that the user was{' '}
          <span className="font-bold underline decoration-amber-400">
            not evidently attempting to complete the wizard
          </span>
          . Therefore we do not provide a score:
        </p>
        <CodeBlock>score = null</CodeBlock>

        <p>Otherwise, we start by establishing a baseline score:</p>
        <CodeBlock>score = 100 - 15*failedSteps - 10*errors - 5*backSteps</CodeBlock>

        <p>
          If the <span className="font-bold underline decoration-rose-500">wizard was cancelled/abandoned</span> we
          deduct extra points. We deduct <span className="font-bold underline decoration-rose-500">20 points</span>,
          extra points for the <span className="font-bold underline decoration-rose-500">negative actions</span> and for
          the <span className="font-bold underline decoration-rose-500">elapsed time</span> (1.0 points per 6 seconds):
        </p>
        <CodeBlock>score = score - 20 - 3*(errors + stepErrors + backStepCount) - timespan/6</CodeBlock>

        <p>
          The <span className="font-bold underline decoration-rose-500">minimum score is 0</span>, so if the score drops
          below that, we assign it a score of 0. In case the score is below 40 and the wizard was completed, we{' '}
          <span className="font-bold underline decoration-emerald-500">assign a score of 40</span> to the wizard,
          rewarding the completion.
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
