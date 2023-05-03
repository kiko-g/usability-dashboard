import { isJson } from './utils';
import { ITrackerEventCategory, ITrackerEvent } from '../@types';

export const config = {
  matomoToken: process.env.NEXT_PUBLIC_MATOMO_TOKEN,
  matomoSiteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
  matomoSiteUrl: process.env.NEXT_PUBLIC_MATOMO_SITE_URL,
};

export const parseAndGroupEvents = (body: string | any[], filterBy?: string) => {
  const eventsByComponent = new Map();
  const events = Array.isArray(body) ? body : JSON.parse(body);

  for (const event of events) {
    let parsedEvent;

    if (isJson(event.Events_EventCategory)) {
      const category = JSON.parse(event.Events_EventCategory) as ITrackerEventCategory;
      parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEvent;
    } else {
      parsedEvent = { category: event.Events_EventCategory, action: event.Events_EventAction };
    }

    const component = parsedEvent.component;

    if (filterBy !== undefined && !component?.includes(filterBy)) continue;

    if (eventsByComponent.has(component)) {
      eventsByComponent.get(component).push(parsedEvent);
    } else {
      eventsByComponent.set(component, [parsedEvent]);
    }
  }

  const groupedEvents = Array.from(eventsByComponent.values());
  return groupedEvents;
};
