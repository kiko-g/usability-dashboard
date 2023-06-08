import { OverviewMatomoResponse, TransitionMatomo } from './matomo';

export interface Frequency {
  name: string;
  value: number;
}

// Event typing
export interface ITrackerEventRawCategory {
  component: string;
  name: string;
  time: string;
  path: string;
}

export interface ITrackerEventRawEvent extends ITrackerEventRawCategory {
  action: string;
}

export interface ITrackerEvent {
  time: string;
  path: string;
  action: string;
}

export interface ITrackerEventGroup {
  component: string;
  name: string;
  events: ITrackerEvent[];
}

// Wizards
export interface IWizardStepsStatus {
  total: number;
  visible: number;
  current: number;
}

export interface IWizard extends ITrackerEventGroup {
  score: number;
  timespan: number;
  completed: boolean;
  errorCount: number;
  backStepCount: number;
  failedStepCount: number;
  stepStatus: IWizardStepsStatus;
}

export interface IWizardGroup {
  name: string;
  stats: WizardStats;
  wizards: IWizard[];
}

export type WizardStats = {
  total: number;
  completed: number;
  notCompleted: number;
  completedRatio: number;
  avgScore: number;
  stdDevScore: number | null;
  scores: number[];
  avgTimespan: number;
  stdDevTimespan: number | null;
  timespans: number[];
  avgErrors: number;
  avgFailedSteps: number;
  avgBackSteps: number;
  totalErrors: number;
  totalBackSteps: number;
  totalFailedSteps: number;
  avgSuccessfulStepTime: number | null;
  minSuccessfulStepTime: number | null;
  maxSuccessfulStepTime: number | null;
};

// Execution Views
export interface IExecutionView extends ITrackerEventGroup {
  score: number;
  timespan: number;
  completed: boolean;
  errorCount: number;
  tabChangeCount: number;
}

export interface IExecutionViewGroup {
  name: string;
  stats: ExecutionViewStats;
  executionViews: IExecutionView[];
}

export type ExecutionViewStats = {
  total: number;
  completed: number;
  notCompleted: number;
  completedRatio: number;
  avgScore: number;
  stdDevScore: number | null;
  scores: number[];
  avgTimespan: number;
  stdDevTimespan: number | null;
  timespans: number[];
  avgErrors: number;
  avgTabChanges: number;
  totalErrors: number;
  totalTabChanges: number;
};

// Buttons
export type ButtonClick = {
  component: string;
  path: string;
  time: string;
};

export type ButtonType = {
  name: string;
  clickCount: number;
  buttonClicks: ButtonClick[];
};

// Visits
export type Visits = {
  os: Frequency[];
  browsers: Frequency[];
  devices: Frequency[];
  screens: Frequency[];
  pagesExpanded: Frequency[];
  pagesFlat: Frequency[];
  transitions: TransitionMatomo[];
  overview: OverviewMatomoResponse;
};

// API Error
export type CustomAPIError = {
  error: string;
  message?: string;
  details?: any;
};

//////////////////////////////////////////////////////////////

// Mouse Clicks
export type MouseClicksSQL = {
  x: string;
  y: string;
  dateString: string;
};

export type MouseClicksAPI = {
  x: number;
  y: number;
  date: Date;
};

// Page Views
export type PageViewsSQL = {
  id: number;
  visitor: any;
  duration: number;
  pageTitles: string;
  pageUrls: string;
  startTime: string;
  totalEvents: number;
  totalActions: number;
  totalInteractions: number;
  operatingSystem: string;
  deviceScreenSize: string;
  browserName: string;
  deviceBrand: string;
  deviceType: string;
};

export type PageViewsAPI = {
  id: number;
  visitor: any; // TODO: fix
  duration: number;
  pageTitles: string[];
  visitedUrls: string[];
  startTime: Date;
  totalEvents: number;
  totalActions: number;
  totalInteractions: number;
  operatingSystem: string;
  deviceScreenSize: {
    width: number;
    height: number;
  };
  browserName: string;
  deviceBrand: string;
  deviceType: string;
};

// Mouse Clicks Viz Types
export type MouseClickVizType = 'table' | 'chart' | 'heatmap' | 'all';
export type MouseClickVizTypeFilter = {
  name: string;
  value: MouseClickVizType;
};

// Page Visits Viz Types
export type PageVisitsVizType = 'table' | 'urls' | 'browsers' | 'devices' | 'screens' | 'os' | 'all';
export type PageVisitsVizTypeFilter = {
  name: string;
  value: PageVisitsVizType;
};

// Data
export interface PieData {
  name: string;
  count: number;
}
