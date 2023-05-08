import { isJson } from './index';
import { ITrackerEventRawCategory, ITrackerEventRawEvent, ITrackerEventGroup, IWizard } from '../@types';

export const config = {
  matomoToken: process.env.NEXT_PUBLIC_MATOMO_TOKEN,
  matomoSiteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
  matomoSiteUrl: process.env.NEXT_PUBLIC_MATOMO_SITE_URL,
};

function findComponentName(group: ITrackerEventRawEvent[]): string {
  let name = ""
  for (let i = 0; i < group.length; i++) {
    name = group[i].name;
    if (name !== "") break;
  }

  return name
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

export const parseAndGroupEvents = (body: string | any[], filterBy?: string): ITrackerEventGroup[] => {
  const eventsByComponent = new Map();
  const events = Array.isArray(body) ? body : JSON.parse(body);

  for (const event of events) {
    if (!isJson(event.Events_EventCategory)) continue

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

export const evaluateWizards = (groupedWizards: ITrackerEventGroup[]): IWizard[] => {
  const result: IWizard[] = [];

  for (const wizard of groupedWizards) {
    let score = 100;
    let completed = false;

    for (const event of wizard.events) {
      if (event.action.includes('Error')) {
        score -= 2;
      }
    }

    if (wizard.events.length > 0 && wizard.events[wizard.events.length - 1].action.includes('Completed')) {
      completed = true;
    }

    const evaluatedWizard: IWizard = {
      ...wizard,
      score,
      completed,
    };

    result.push(evaluatedWizard);
  }

  return result;
};
