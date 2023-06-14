// Wizard
export type WizardStats = {
  avgScore: number | null;
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

export type WizardStepCompletionStats = {
  activated: number;
  successful: number;
  failed: number;
  minSuccessfulStepTime: number;
  maxSuccessfulStepTime: number;
  avgSuccessfulStepTime: number;
  stdDevSuccessfulStepTime: number | null;
};

export type WizardErrorStatsType = {
  avgBack: number;
  avgError: number;
  avgFailedSteps: number;
  totalBackSteps: number;
  totalErrors: number;
  totalFailedSteps: number;
};

// Execution View
export type ExecutionViewStats = {
  avgScore: number | null;
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

export type ExecutionViewTabCompletionStats = {
  activated: number;
  successful: number;
  failed: number;
  minSuccessfulTabTime: number;
  maxSuccessfulTabTime: number;
  avgSuccessfulTabTime: number;
  stdDevSuccessfulTabTime: number | null;
};

export type ExecutionViewErrorStatsType = {
  avgError: number;
  avgTabChanges: number;
  avgFailedTabs: number;
  totalErrors: number;
  totalTabChanges: number;
  totalFailedTabs: number;
};
