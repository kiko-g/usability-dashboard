import request from 'request';
import { config } from '../../../utils/matomo';
import type { CustomAPIError, Browser } from '../../../@types';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseType = Browser[] | CustomAPIError;

export default function getMostUsedOperatingSystems(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getBrowsers&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  request(apiUrl, { json: true }, (err, response, body) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (response.statusCode !== 200 || body.result === 'error') {
      return res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
    }

    const mostUsedBrowsers = body
      .map((browser: any) => {
        return {
          name: browser.label,
          visitCount: parseInt(browser.nb_visits),
        };
      })
      .sort((a: Browser, b: Browser) => b.visitCount - a.visitCount);

    return res.status(200).json(mostUsedBrowsers);
  });
}
