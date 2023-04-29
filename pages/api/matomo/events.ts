import request from 'request';
import { isJson } from '../../../utils';
import { ITrackerEventCategory, ITrackerEvent } from '../../../@types';
import { NextApiRequest, NextApiResponse } from 'next';

const siteId = 1;
const matomoUrl = 'http://localhost:80';
const matomoToken = '9a7c2dea66b81a8a903c10a06ebcd5e0';

export default function matomoApiTest(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const period = 'range'; // day, week, month, year, range

    const currentDate = new Date();
    const formattedCurrentDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const date = `2023-04-29,${formattedCurrentDate}`;

    const method = 'Events.getCategory';
    const format = 'json';
    const apiUrl = `${matomoUrl}/index.php?module=API&method=${method}&expanded=1&secondaryDimension=eventAction&flat=1&format=${format}&idSite=${siteId}&period=${period}&date=${date}&token_auth=${matomoToken}`;

    request(apiUrl, { json: true }, (err, response, body) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (response.statusCode !== 200 || body.result === 'error') {
        return res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
      }

      const data = [];
      const events = Array.isArray(body) ? body : JSON.parse(body);

      for (const event of events) {
        if (isJson(event.Events_EventCategory)) {
          const category = JSON.parse(event.Events_EventCategory) as ITrackerEventCategory;
          const parsedEvent = { ...category, action: event.Events_EventAction } as ITrackerEvent;
          data.push(parsedEvent);
        }
        else {
          const parsedEvent = { category: event.Events_EventCategory, action: event.Events_EventAction };
          data.push(parsedEvent);
        }
      }

      return res.status(200).json(data);
    });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
