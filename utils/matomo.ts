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
  ButtonType,
  IWizardStepsStatus,
} from '@/@types';

export enum WizardAction {
  Start = 'Start',
  Close = 'Close',
  Complete = 'Complete',
  Cancel = 'Cancel',
  Error = 'Error',
  ActivateStep = 'Activate Step',
  SuccessStep = 'Success Step',
  UpdateSteps = 'New Steps',
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

function updateSteps(action: string) {
  const split = action.split(': ');
  if (split.length < 2) return;

  const stepStatusRaw = split[1];
  const stepStatus = JSON.parse(stepStatusRaw) as IWizardStepsStatus;
  return { total: stepStatus.total, visible: stepStatus.visible, current: stepStatus.current };
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
  const eventsUnsorted = Array.isArray(body) ? body : JSON.parse(body);
  const events = eventsUnsorted.sort(
    (a: any, b: any) => new Date(a.Events_EventTime).getTime() - new Date(b.Events_EventTime).getTime()
  );

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
    // ignore wizard with no events
    if (wizard.events.length === 0) continue;

    let totalSteps = 1;
    let visibleSteps = 1;
    let currentStep = 0;

    let errorCount = 0;
    let backStepCount = 0;
    let failedStepCount = 0;

    let closed = false;
    let cancelled = false;
    let completed = false;

    // parse events
    wizard.events.forEach((event, eventIdx) => {
      if (event.action.includes(WizardAction.UpdateSteps)) {
        let stepStatus = updateSteps(event.action);
        if (stepStatus) {
          totalSteps = stepStatus.total;
          visibleSteps = stepStatus.visible;
          currentStep = stepStatus.current;
        }
      } else if (event.action.includes(WizardAction.Error)) {
        errorCount++;
      } else if (event.action.includes(WizardAction.FailStep)) {
        failedStepCount++;
      } else if (event.action.includes(WizardAction.BackStep)) {
        backStepCount++;
      } else if (event.action.includes(WizardAction.Close)) {
        closed = true;
        let stepStatus = updateSteps(event.action);
        if (stepStatus) {
          totalSteps = stepStatus.total;
          visibleSteps = stepStatus.visible;
          currentStep = stepStatus.current;
        }
      } else if (event.action.includes(WizardAction.Cancel)) {
        cancelled = true;
        let stepStatus = updateSteps(event.action);
        if (stepStatus) {
          totalSteps = stepStatus.total;
          visibleSteps = stepStatus.visible;
          currentStep = stepStatus.current;
        }
      } else if (event.action.includes(WizardAction.Complete)) {
        completed = true;
        let stepStatus = updateSteps(event.action);
        if (stepStatus) {
          totalSteps = stepStatus.total;
          visibleSteps = stepStatus.visible;
          currentStep = stepStatus.current;
        }
      }
    });

    // scoring constants
    const timeThreshold = 10; // 10 seconds
    const failedStepPenalty = 15; // 15 points
    const errorPenalty = 10; // 10 points
    const backStepPenalty = 5; // 5 points
    const negativeActionPenalty = 3; // 3 points
    const cancelStaticPenalty = 20; // 20 points
    const secondsToPenalty = 6.0; // 6.0 seconds per point

    // auxiliar calculations
    const timespan = findComponentTimespan(wizard.events);
    const negativeActions = errorCount + failedStepCount + backStepCount;
    const discarded = negativeActions === 0 && timespan < timeThreshold;

    // calculate score
    let score: number | null = 100;
    score = score - failedStepCount * failedStepPenalty - errorCount * errorPenalty - backStepCount * backStepPenalty;

    // generate scoring formula string
    let formulaStr = `${score}`;
    formulaStr += ` - ${failedStepCount}*${failedStepPenalty}`;
    formulaStr += ` - ${errorCount}*${errorPenalty}`;
    formulaStr += ` - ${backStepCount}*${backStepPenalty}`;

    // penalty for not completing
    if (!completed) {
      if (discarded) {
        score = null;
        formulaStr = 'N/A';
      } else {
        score = score - cancelStaticPenalty - negativeActionPenalty * negativeActions - timespan / secondsToPenalty;
        formulaStr += ` - ${cancelStaticPenalty}`;
        formulaStr += ` - ${negativeActionPenalty}*${negativeActions}`;
        formulaStr += ` - ${timespan.toFixed(0)}/${secondsToPenalty}`;
      }
    }

    if (score !== null) {
      formulaStr += ` = ${score.toFixed(0)}`; // save score before corrections

      // apply corrections
      if (score < 40 && completed) score = 40; // prevent too low score if completed
      else if (score < 0) score = 0; // prevent negative score
    }

    const evaluatedWizard: IWizard = {
      ...wizard,
      score,
      formulaStr,
      timespan,
      completed,
      discarded,
      errorCount,
      failedStepCount,
      backStepCount,
      stepStatus: {
        total: totalSteps < 1 ? 1 : totalSteps,
        visible: visibleSteps < 1 ? 1 : visibleSteps,
        current: currentStep < 0 ? 0 : currentStep,
      },
    };
    result.push(evaluatedWizard);
  }

  return result;
};

export const groupWizardsByType = (wizards: IWizard[]): IWizardGroup[] => {
  const groupedWizards: IWizardGroup[] = [];

  // Group wizards by name
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
          avgFailedSteps: 0,
          avgBackSteps: 0,
          totalErrors: 0,
          totalBackSteps: 0,
          totalFailedSteps: 0,
          avgSuccessfulStepTime: 0,
          minSuccessfulStepTime: Infinity,
          maxSuccessfulStepTime: 0,
        },
        wizards: [],
      };
      groupedWizards.push(group);
    }

    if (wizard.score !== null && group.stats.avgScore !== null) {
      group.stats.avgScore += wizard.score;
      group.stats.scores.push(wizard.score);
    }

    group.stats.avgTimespan += wizard.timespan;
    group.stats.timespans.push(wizard.timespan);

    group.stats.totalErrors += wizard.errorCount;
    group.stats.totalBackSteps += wizard.backStepCount;
    group.stats.totalFailedSteps += wizard.failedStepCount;
    wizard.completed ? group.stats.completed++ : group.stats.notCompleted++;

    group.wizards.push(wizard);
  }

  // Calculate stats after accumulating all wizards
  for (const group of groupedWizards) {
    const totalCount = group.wizards.length;
    group.stats.total = totalCount;
    group.stats.completedRatio = group.stats.completed / totalCount;

    group.stats.avgErrors = group.stats.totalErrors / totalCount;
    group.stats.avgBackSteps = group.stats.totalBackSteps / totalCount;
    group.stats.avgFailedSteps = group.stats.totalFailedSteps / totalCount;

    if (group.stats.avgScore === 0 || group.stats.avgScore === null) group.stats.avgScore = null;
    else group.stats.avgScore /= totalCount;

    const scoresFiltered = group.stats.scores.filter((score) => score !== null) as number[];
    group.stats.stdDevScore = standardDeviation(scoresFiltered);

    group.stats.avgTimespan /= totalCount;
    group.stats.stdDevTimespan = standardDeviation(group.stats.timespans);

    const successfulStepTimes: number[] = [];
    group.wizards.forEach((wizard) => {
      const events = wizard.events;
      let successfulStepCount = 0;
      let isStepActivated = false;
      let activatedTime: number | null = null;

      for (const event of events) {
        if (event.action.includes(WizardAction.ActivateStep)) {
          isStepActivated = true;
          activatedTime = new Date(event.time).getTime();
        } else if (event.action.includes(WizardAction.SuccessStep) && isStepActivated) {
          if (activatedTime !== null) {
            const successTime = new Date(event.time).getTime();
            const stepTime = (successTime - activatedTime) / 1000; // Convert to seconds
            successfulStepTimes.push(stepTime);
            activatedTime = null;
          }
          isStepActivated = false;
          successfulStepCount++;
        }
      }
    });

    if (successfulStepTimes.length > 0) {
      group.stats.avgSuccessfulStepTime = successfulStepTimes.reduce((a, b) => a + b, 0) / successfulStepTimes.length;
      group.stats.minSuccessfulStepTime = Math.min(...successfulStepTimes);
      group.stats.maxSuccessfulStepTime = Math.max(...successfulStepTimes);
    } else {
      group.stats.avgSuccessfulStepTime = null;
      group.stats.minSuccessfulStepTime = null;
      group.stats.maxSuccessfulStepTime = null;
    }
  }

  return groupedWizards.sort((a, b) => {
    if (a.stats.avgScore === null && b.stats.avgScore === null) return 0;
    if (a.stats.avgScore === null) return 1;
    if (b.stats.avgScore === null) return -1;
    return a.stats.avgScore < b.stats.avgScore ? 1 : -1;
  });
};

export const evaluateExecutionViews = (executionViews: ITrackerEventGroup[]): IExecutionView[] => {
  const result: IExecutionView[] = [];

  for (const executionView of executionViews) {
    if (executionView.events.length === 0) continue;

    let score = 100;
    let completed = false;
    let cancelled = false;
    let errorCount = 0;
    let tabChangeCount = 0;
    let timespan = findComponentTimespan(executionView.events);

    executionView.events.forEach((event, index) => {
      // error penalty
      if (event.action.includes(ExecutionViewAction.Error)) {
        errorCount++;
      }
      // process tab change
      else if (event.action.includes(ExecutionViewAction.TabChange)) {
        tabChangeCount++;
      }
      // cancel wizard penalty
      else if (event.action.includes(ExecutionViewAction.Cancel)) {
        cancelled = true;
      }
      // complete wizard bonus
      else if (event.action.includes(ExecutionViewAction.Complete)) {
        completed = true;
      }
    });

    score = score - 10 * errorCount - 5 * tabChangeCount;

    // prevent the absence of complete or cancel action
    if (!completed || cancelled) {
      if (timespan > 20) score -= timespan / 20 - 4 * errorCount;
      else score -= 5;
    }

    if (score < 40 && completed) score = 40; // prevent too low score if completed
    else if (score < 0) score = 0; // prevent negative score

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

export const parseButtons = (body: string): ButtonType[] => {
  const buttons: ButtonType[] = [];
  const events = Array.isArray(body) ? body : JSON.parse(body);

  for (const event of events) {
    if (!isJson(event.Events_EventCategory)) continue;

    const category = JSON.parse(event.Events_EventCategory) as ITrackerEventRawCategory;
    const parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEventRawEvent;
    const component = parsedEvent.component;

    if (!component?.includes('base-action-button')) continue;

    let button = buttons.find((b) => b.name === parsedEvent.name);

    if (!button) {
      button = {
        name: parsedEvent.name,
        clickCount: 0,
        buttonClicks: [],
      };
      buttons.push(button);
    }

    button.clickCount += 1;
    button.buttonClicks.push({
      component: component,
      path: parsedEvent.path,
      time: parsedEvent.time,
    });
  }

  return buttons;
};

// to be used in a frontend
export const evaluateAndGroupWizards = (wizards: ITrackerEventGroup[], scoringType?: 'A' | 'B' | 'C') => {
  const evaluatedWizards = evaluateWizards(wizards);
  const groupedWizards = groupWizardsByType(evaluatedWizards);
  return groupedWizards;
};

export const evaluateAndGroupExecutionViews = (executionViews: ITrackerEventGroup[], scoringType?: 'A' | 'B' | 'C') => {
  const evaluatedExecutionViews = evaluateExecutionViews(executionViews);
  const groupedExecutionViews = groupExecutionViews(evaluatedExecutionViews);
  return groupedExecutionViews;
};
