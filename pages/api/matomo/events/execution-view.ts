import request from 'request';
import { NextApiRequest, NextApiResponse } from 'next';
import { config, parseAndGroupEvents } from '../../../../utils/matomo';
import { CustomAPIError, ITrackerEventGroup } from '../../../../@types';

type ResponseType = ITrackerEventGroup[] | CustomAPIError;

export default function eventsGroupedWizardsMatomoApi(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
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

    const groupedEvents = parseAndGroupEvents(body, 'execution-view');
    res.status(200).json(groupedEvents);
  });
}
