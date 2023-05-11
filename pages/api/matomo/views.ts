import request from 'request';
import { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../utils/matomo';
import { CustomAPIError } from '../../../@types';

type VisitsPerDay = {
  day: string;
  visitCount: number;
};

type ResponseType = VisitsPerDay[] | CustomAPIError;

export default function getVisitsPerDay(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'day';
  const date = `last30`; // last30, previous30, or any range like '2023-04-29,today'
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=VisitsSummary.get&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  request(apiUrl, { json: true }, (err, response, body) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    }

    if (response.statusCode !== 200 || body.result === 'error') {
      res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
    }

    const visitsPerDay: VisitsPerDay[] = Object.entries(body).map(([day, visitCount]) => ({
      day,
      visitCount: parseInt(visitCount as string),
    }));

    res.status(200).json(visitsPerDay);
  });
}
