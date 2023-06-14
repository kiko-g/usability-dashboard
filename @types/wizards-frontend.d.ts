export type WizardStats = {
  avgScore: number;
  minTime: number;
  maxTime: number;
  avgTime: number;
  stdDevTime: number | null;
  total: number;
  completed: number;
  cancelled: number;
  discarded: number;
  notCompleted: number;
  completedRatio: number;
};

export type StepCompletionStats = {
  activated: number;
  successful: number;
  failed: number;
  minSuccessfulStepTime: number;
  maxSuccessfulStepTime: number;
  avgSuccessfulStepTime: number;
  stdDevSuccessfulStepTime: number | null;
};

export type ErrorStatsType = {
  avgBack: number;
  avgError: number;
  avgFailedSteps: number;
  totalBackSteps: number;
  totalErrors: number;
  totalFailedSteps: number;
};
