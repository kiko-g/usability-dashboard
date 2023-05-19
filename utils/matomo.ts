import { isJson, standardDeviation } from './index';
import type {
  ITrackerEventRawCategory,
  ITrackerEventRawEvent,
  ITrackerEventGroup,
  IWizard,
  ITrackerEvent,
  IWizardGroup,
  IExecutionView,
  IExecutionViewGroup,
  Button,
  ButtonClick,
} from '../@types';

export enum WizardAction {
  Start = 'Start',
  Complete = 'Complete',
  Cancel = 'Cancel',
  Error = 'Error',
  ActivateStep = 'Activate Step',
  SuccessStep = 'Success Step',
  FailStep = 'Fail Step',
  NextStep = 'Next Step',
  BackStep = 'Back Step',
}

export enum ExecutionViewAction {
  Start = 'Start',
  Complete = 'Complete',
  Cancel = 'Cancel',
  Error = 'Error',
  TabChange = 'Tab Change',
}

export const osMapping: { [key: string]: string } = {
  WIN: 'Windows',
  MAC: 'macOS',
  LIN: 'Linux',
  AND: 'Android',
  IOS: 'iOS',
};

export const config = {
  matomoToken: process.env.NEXT_PUBLIC_MATOMO_TOKEN,
  matomoSiteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
  matomoSiteUrl: process.env.NEXT_PUBLIC_MATOMO_SITE_URL,
};

function findComponentName(group: ITrackerEventRawEvent[]): string {
  let name = '';
  for (let i = 0; i < group.length; i++) {
    name = group[i].name;
    if (name !== '') break;
  }

  return name;
}

function findComponentTimespan(group: ITrackerEvent[]) {
  if (group.length <= 1) return 0;

  const first = group[0];
  const last = group[group.length - 1];

  const firstTime = new Date(first.time);
  const lastTime = new Date(last.time);

  return (lastTime.getTime() - firstTime.getTime()) / 1000;
}

function transformGroupedEvents(groupedEvents: ITrackerEventRawEvent[][]): ITrackerEventGroup[] {
  const result: ITrackerEventGroup[] = [];

  groupedEvents.forEach((group) => {
    const transformedGroup: ITrackerEventGroup = {
      component: group[0].component,
      name: findComponentName(group),
      events: [],
    };

    group.forEach((entry) => {
      transformedGroup.events.push({
        time: entry.time,
        path: entry.path,
        action: entry.action,
      });
    });

    result.push(transformedGroup);
  });

  return result;
}

export const parseEvents = (body: string | any[], filterBy?: string): ITrackerEventGroup[] => {
  const eventsByComponent = new Map();
  const events = Array.isArray(body) ? body : JSON.parse(body);

  for (const event of events) {
    if (!isJson(event.Events_EventCategory)) continue;

    const category = JSON.parse(event.Events_EventCategory) as ITrackerEventRawCategory;
    const parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEventRawEvent;
    const component = parsedEvent.component;

    if (filterBy !== undefined && !component?.includes(filterBy)) continue;

    if (eventsByComponent.has(component)) {
      eventsByComponent.get(component).push(parsedEvent);
    } else {
      eventsByComponent.set(component, [parsedEvent]);
    }
  }

  const groupedEvents = Array.from(eventsByComponent.values());
  const transformedGroupedEvents = transformGroupedEvents(groupedEvents);

  return transformedGroupedEvents;
};

export const evaluateWizards = (wizards: ITrackerEventGroup[]): IWizard[] => {
  const result: IWizard[] = [];

  for (const wizard of wizards) {
    if (wizard.events.length === 0) {
      result.push({
        ...wizard,
        score: 0,
        timespan: 0,
        errorCount: 0,
        backStepCount: 0,
        completed: false,
      });
    }

    let score = 100;
    let completed = false;
    let errorCount = 0;
    let backStepCount = 0;
    let timespan = findComponentTimespan(wizard.events);

    for (const event of wizard.events) {
      // wizard error penalty
      if (event.action.includes(WizardAction.Error)) {
        score -= 10;
        errorCount++;
      }

      // fail step penalty
      if (event.action.includes(WizardAction.FailStep)) {
        score -= 8;
        errorCount++;
      }

      // back to previous step penalty
      if (event.action.includes(WizardAction.BackStep)) {
        score -= 5;
        backStepCount++;
      }

      // cancel wizard penalty
      if (event.action.includes(WizardAction.Cancel)) {
        score -= 3;
      }
    }

    const lastEvent = wizard.events[wizard.events.length - 1];
    if (lastEvent.action.includes(WizardAction.Complete)) {
      completed = true;
    }

    if (score < 20 && completed) score = 20;
    else if (score < 0) score = 0;

    const evaluatedWizard: IWizard = {
      ...wizard,
      score,
      timespan,
      completed,
      errorCount,
      backStepCount,
    };

    result.push(evaluatedWizard);
  }

  return result;
};

export const groupWizards = (wizards: IWizard[]): IWizardGroup[] => {
  const groupedWizards: IWizardGroup[] = [];

  // group wizards by name
  for (const wizard of wizards) {
    let group = groupedWizards.find((g) => g.name === wizard.name);

    if (!group) {
      group = {
        name: wizard.name,
        stats: {
          total: 0,
          completed: 0,
          notCompleted: 0,
          completedRatio: 0,
          avgScore: 0,
          stdDevScore: 0,
          scores: [],
          avgTimespan: 0,
          stdDevTimespan: 0,
          timespans: [],
          avgErrors: 0,
          avgBackSteps: 0,
          totalErrors: 0,
          totalBackSteps: 0,
        },
        wizards: [],
      };
      groupedWizards.push(group);
    }

    group.stats.avgScore += wizard.score;
    group.stats.scores.push(wizard.score);

    group.stats.avgTimespan += wizard.timespan;
    group.stats.timespans.push(wizard.timespan);

    group.stats.totalErrors += wizard.errorCount;
    group.stats.totalBackSteps += wizard.backStepCount;
    wizard.completed ? group.stats.completed++ : group.stats.notCompleted++;

    group.wizards.push(wizard);
  }

  // calculate stats after accumulating all wizards
  for (const group of groupedWizards) {
    const totalCount = group.wizards.length;
    group.stats.total = totalCount;
    group.stats.completedRatio = group.stats.completed / totalCount;

    group.stats.avgErrors = group.stats.totalErrors / totalCount;
    group.stats.avgBackSteps = group.stats.totalBackSteps / totalCount;

    group.stats.avgScore /= totalCount;
    group.stats.stdDevScore = standardDeviation(group.stats.scores);

    group.stats.avgTimespan /= totalCount;
    group.stats.stdDevTimespan = standardDeviation(group.stats.timespans);
  }

  return groupedWizards.sort((a, b) => (a.stats.avgScore < b.stats.avgScore ? 1 : -1));
};

export const evaluateExecutionViews = (executionViews: ITrackerEventGroup[]): IExecutionView[] => {
  const result: IExecutionView[] = [];

  for (const executionView of executionViews) {
    if (executionView.events.length === 0) {
      result.push({
        ...executionView,
        score: 0,
        timespan: 0,
        errorCount: 0,
        tabChangeCount: 0,
        completed: false,
      });
    }

    let score = 100;
    let completed = false;
    let errorCount = 0;
    let tabChangeCount = 0;
    let timespan = findComponentTimespan(executionView.events);

    // TODO: evaluate execution view events and type actions

    const lastEvent = executionView.events[executionView.events.length - 1];
    if (lastEvent.action.includes(WizardAction.Complete)) {
      completed = true;
    }

    if (score < 20 && completed) score = 20;
    else if (score < 0) score = 0;

    const evaluatedExecutionView: IExecutionView = {
      ...executionView,
      score,
      timespan,
      completed,
      errorCount,
      tabChangeCount,
    };

    result.push(evaluatedExecutionView);
  }

  return result;
};

export const groupExecutionViews = (executionViews: IExecutionView[]): IExecutionViewGroup[] => {
  const groupedExecutionViews: IExecutionViewGroup[] = [];

  // group execution views by name
  for (const executionView of executionViews) {
    let group = groupedExecutionViews.find((g) => g.name === executionView.name);

    if (!group) {
      group = {
        name: executionView.name,
        stats: {
          total: 0,
          completed: 0,
          notCompleted: 0,
          completedRatio: 0,
          avgScore: 0,
          stdDevScore: 0,
          scores: [],
          avgTimespan: 0,
          stdDevTimespan: 0,
          timespans: [],
          avgErrors: 0,
          avgTabChanges: 0,
          totalErrors: 0,
          totalTabChanges: 0,
        },
        executionViews: [],
      };
      groupedExecutionViews.push(group);
    }

    group.stats.avgScore += executionView.score;
    group.stats.scores.push(executionView.score);

    group.stats.avgTimespan += executionView.timespan;
    group.stats.timespans.push(executionView.timespan);

    group.stats.totalErrors += executionView.errorCount;
    group.stats.total += executionView.tabChangeCount;
    executionView.completed ? group.stats.completed++ : group.stats.notCompleted++;

    group.executionViews.push(executionView);
  }

  // calculate stats after accumulating all execution views
  for (const group of groupedExecutionViews) {
    const totalCount = group.executionViews.length;
    group.stats.total = totalCount;
    group.stats.completedRatio = group.stats.completed / totalCount;

    group.stats.avgErrors = group.stats.totalErrors / totalCount;
    group.stats.avgTabChanges = group.stats.totalTabChanges / totalCount;

    group.stats.avgScore /= totalCount;
    group.stats.stdDevScore = standardDeviation(group.stats.scores);

    group.stats.avgTimespan /= totalCount;
    group.stats.stdDevTimespan = standardDeviation(group.stats.timespans);
  }

  return groupedExecutionViews.sort((a, b) => (a.stats.avgScore < b.stats.avgScore ? 1 : -1));
};



export const parseButtons = (body: string): Button[] => {
  const data: ITrackerEventRawEvent[] = JSON.parse(body);
  const buttonMap = new Map<string, Button>();

  data.forEach(event => {
    const existingButton = buttonMap.get(event.name);
    const buttonClick = {
      component: event.component,
      path: event.path,
      time: event.time
    };
    if (existingButton) {
      existingButton.clickCount++;
      existingButton.buttonClicks.push(buttonClick);
    } else {
      buttonMap.set(event.name, { 
        name: event.name, 
        clickCount: 1, 
        buttonClicks: [buttonClick] 
      });
    }
  });

  return Array.from(buttonMap.values());
};
