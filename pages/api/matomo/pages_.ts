import request from 'request';
import { config } from '../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError, VisitedPage } from '../../../@types';

type ResponseType = VisitedPage[] | CustomAPIError;

export default function getMostVisitedPages(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Actions.getPageUrls&flat=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  request(apiUrl, { json: true }, (err, response, body) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (response.statusCode !== 200 || body.result === 'error') {
      return res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
    }

    const mostVisitedPages: VisitedPage[] = body
      .map((page: any) => ({
        page: page.label,
        visitCount: page.nb_visits,
      }))
      .sort((a: VisitedPage, b: VisitedPage) => (a.visitCount < b.visitCount ? 1 : -1));

    return res.status(200).json(mostVisitedPages);
  });
}
