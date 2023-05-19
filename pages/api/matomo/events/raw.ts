import axios from 'axios';
import { isJson } from '../../../../utils';
import { config } from '../../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ITrackerEventRawCategory, ITrackerEvent, CustomAPIError } from '../../../../@types';

type ResponseType = any | CustomAPIError;

export default async function getRawMatomoApiEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Events.getCategory&secondaryDimension=eventAction&flat=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.status !== 200 || response.data.result === 'error') {
      return res.status(response.status).json({ error: 'Error from Matomo API', message: response.data.message });
    }

    const parsedEvents = [];
    const events = Array.isArray(response.data) ? response.data : JSON.parse(response.data);

    for (const event of events) {
      let parsedEvent;

      if (isJson(event.Events_EventCategory)) {
        const category = JSON.parse(event.Events_EventCategory) as ITrackerEventRawCategory;
        parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEvent;
      } else parsedEvent = { category: event.Events_EventCategory, action: event.Events_EventAction };

      parsedEvents.push(parsedEvent);
    }

    return res.status(200).json(parsedEvents);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
