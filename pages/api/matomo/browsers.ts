import request from 'request';
import { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../utils/matomo';
import { CustomAPIError, Browser } from '../../../@types';

type ResponseType = Browser[] | CustomAPIError;

export default function getMostUsedOperatingSystems(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getBrowsers&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  const osMapping: { [key: string]: string } = {
    WIN: 'Windows',
    MAC: 'macOS',
    LIN: 'Linux',
    AND: 'Android',
    IOS: 'iOS',
  };

  request(apiUrl, { json: true }, (err, response, body) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    }

    if (response.statusCode !== 200 || body.result === 'error') {
      res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
    }

    const mostUsedBrowsers = body
      .map((browser: any) => {
        return {
          name: browser.label,
          visitCount: parseInt(browser.nb_visits),
        };
      })
      .sort((a: Browser, b: Browser) => b.visitCount - a.visitCount);

    res.status(200).json(mostUsedBrowsers);
  });
}
