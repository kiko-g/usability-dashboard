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
export interface IWizard extends ITrackerEventGroup {
  score: number;
  timespan: number;
  completed: boolean;
  backStepCount: number;
  errorCount: number;
}

export interface IWizardGroup {
  name: string;
  avgScore: number;
  scoreStdDev: number;
  scores: number[];
  avgTimespan: number;
  completed: number;
  notCompleted: number;
  completedRatio: number;
  total: number;
  totalErrors: number;
  totalBackSteps: number;
  avgErrors: number;
  avgBackSteps: number;
  wizards: IWizard[];
}

// Pages
export type VisitedPage = {
  page: string;
  visitCount: number;
};

// Screens
export type ScreenSize = {
  x: number;
  y: number;
  visitCount: number;
};

// Devices
export type Device = {
  name: string;
  visitCount: number;
};

// Browsers
export type Browser = {
  name: string;
  visitCount: number;
};

// Operating Systems
export type OperatingSystem = {
  name: string;
  visitCount: number;
};

// API Error
export type CustomAPIError = {
  error: string;
  message?: string;
};

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
