import request from 'request';
import { isJson } from '../../../../../utils/utils';
import { config } from '../../../../../utils/matomo';
import { ITrackerEventCategory, ITrackerEvent } from '../../../../../@types';
import { NextApiRequest, NextApiResponse } from 'next';

export default function eventsGroupedMatomoApi(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const period = 'range'; // day, week, month, year, range
    const date = `2023-04-29,today`; // YYYY-MM-DD
    const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Events.getCategory&secondaryDimension=eventAction&flat=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

    request(apiUrl, { json: true }, (err, response, body) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (response.statusCode !== 200 || body.result === 'error') {
        return res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
      }

      const eventsByComponent = new Map();
      const events = Array.isArray(body) ? body : JSON.parse(body);

      for (const event of events) {
        let parsedEvent;

        if (isJson(event.Events_EventCategory)) {
          const category = JSON.parse(event.Events_EventCategory) as ITrackerEventCategory;
          parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEvent;
        }
        else {
          parsedEvent = { category: event.Events_EventCategory, action: event.Events_EventAction };
        }

        const component = parsedEvent.component;
        if (eventsByComponent.has(component)) {
          eventsByComponent.get(component).push(parsedEvent);
        } else {
          eventsByComponent.set(component, [parsedEvent]);
        }
      }

      const groupedEvents = Array.from(eventsByComponent.values());
      return res.status(200).json(groupedEvents);
    });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
