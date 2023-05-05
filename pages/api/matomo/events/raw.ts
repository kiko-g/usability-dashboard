import request from 'request';
import { isJson } from '../../../../utils';
import { config } from '../../../../utils/matomo';
import { ITrackerEventRawCategory, ITrackerEvent, CustomAPIError } from '../../../../@types';
import { NextApiRequest, NextApiResponse } from 'next';

type ResponseType = any | CustomAPIError;

export default function getRawMatomoApiEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') res.status(405).json({ error: 'Method Not Allowed' })

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Events.getCategory&secondaryDimension=eventAction&flat=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  request(apiUrl, { json: true }, (err, response, body) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    }

    if (response.statusCode !== 200 || body.result === 'error') {
      res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
    }

    const parsedEvents = [];
    const events = Array.isArray(body) ? body : JSON.parse(body);

    for (const event of events) {
      let parsedEvent;

      if (isJson(event.Events_EventCategory)) {
        const category = JSON.parse(event.Events_EventCategory) as ITrackerEventRawCategory;
        parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEvent;
      } else parsedEvent = { category: event.Events_EventCategory, action: event.Events_EventAction };

      parsedEvents.push(parsedEvent);
    }

    res.status(200).json(parsedEvents);
  });
}
