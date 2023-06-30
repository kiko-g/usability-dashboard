import { ScoringApproach } from '@/@types';
import { CodeBlock } from '@/components/utils';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

type Props = {
  formula?: ScoringApproach;
};

export function WizardFormula({ formula = 'A' }: Props) {
  let timeThreshold = 10; // 10 seconds
  let failedStepPenalty = 15; // 15 points
  let errorPenalty = 10; // 10 points
  let backStepPenalty = 5; // 5 points
  let negativeActionPenalty = 3; // 3 points
  let cancelStaticPenalty = 20; // 20 points
  let secondsToPenalty = 6.0; // 6.0 seconds per point
  let minimumScoreIfCompleted = 40;
  let discardedText = `there are no negative actions and the `;

  if (formula === 'A') {
    // values are default
  } else if (formula === 'B') {
    negativeActionPenalty = 10;
    cancelStaticPenalty = 0;
    secondsToPenalty = 60.0; // 60.0 seconds per point
  } else if (formula === 'C') {
    timeThreshold = 20; // 5 seconds
    errorPenalty = 10;
    backStepPenalty = 10;
    failedStepPenalty = 10;
    negativeActionPenalty = 0;
    cancelStaticPenalty = 60;
    minimumScoreIfCompleted = 50;
    secondsToPenalty = 600.0; // 600.0 seconds per point
    discardedText = `the timespan was under ${timeThreshold} seconds`;
  } else
    return (
      <div className="mb-1 mt-2 flex items-center gap-2 text-gray-700 dark:text-white">
        <ShieldExclamationIcon className="h-5 w-5" />
        <p>
          Formula <strong>{formula}</strong> is unavailable.
        </p>
      </div>
    );

  return (
    <div className="mb-1 mt-2 text-sm leading-normal tracking-tight text-gray-700 dark:text-white">
      <p>
        The score is calculated based on <strong>whether the wizard was completed</strong> the amount of{' '}
        <strong>wizard errors</strong>, <strong>failed steps</strong> and{' '}
        <strong>back to previous step button clicks</strong>. We deduct point to a wizard based on negative actions. If{' '}
        <span className="font-bold underline decoration-amber-400">{discardedText}</span> we assume that the user was{' '}
        <span className="font-bold underline decoration-amber-400">
          not evidently attempting to complete the wizard
        </span>
        . Therefore we do not provide a score:
      </p>
      <CodeBlock>score = null</CodeBlock>

      <p>Otherwise, we start by establishing a baseline score:</p>
      <CodeBlock>
        score = 100 - {failedStepPenalty}*failedSteps - {errorPenalty}*errors - {backStepPenalty}*backSteps
      </CodeBlock>

      <p>
        If the <span className="font-bold underline decoration-rose-500">wizard was cancelled/abandoned</span> we deduct
        extra points. We deduct{' '}
        <span className="font-bold underline decoration-rose-500">{cancelStaticPenalty} points</span>, extra points for
        the <span className="font-bold underline decoration-rose-500">negative actions</span> and for the{' '}
        <span className="font-bold underline decoration-rose-500">elapsed time</span> (1.0 points per {secondsToPenalty}{' '}
        seconds):
      </p>
      <CodeBlock>
        score = score - {cancelStaticPenalty} - {negativeActionPenalty}*(errors + stepErrors + backStepCount) -
        timespan/{secondsToPenalty}
      </CodeBlock>

      <p>
        The <span className="font-bold underline decoration-rose-500">minimum score is 0</span>, so if the score drops
        below that, we assign it a score of 0. In case the score is below {minimumScoreIfCompleted} and the wizard was
        completed, we{' '}
        <span className="font-bold underline decoration-emerald-500">assign a score of {minimumScoreIfCompleted}</span>{' '}
        to the wizard, rewarding the completion.
      </p>
    </div>
  );
}
