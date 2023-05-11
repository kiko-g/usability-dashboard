import request from 'request';
import { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../utils/matomo';
import { CustomAPIError, ScreenSize } from '../../../@types';

type ResponseType = ScreenSize[] | CustomAPIError;

export default function getMostUsedScreenSizes(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Resolution.getResolution&idSite=${config.matomoSiteId}&period=${period}&date=${date}&format=json&token_auth=${config.matomoToken}`;

  request(apiUrl, { json: true }, (err, response, body) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    }

    if (response.statusCode !== 200 || body.result === 'error') {
      res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
    }

    const mostUsedScreenSizes: ScreenSize[] = body.map((screen: any) => ({
      screen: screen.label,
      visitCount: screen.nb_visits,
    })).sort((a: ScreenSize, b: ScreenSize) => (a.visitCount < b.visitCount ? 1 : -1));

    res.status(200).json(mostUsedScreenSizes);
  });
}
