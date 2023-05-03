import { NextApiRequest, NextApiResponse } from 'next';
import type { PageViewsAPI, PageViewsSQL } from '../../../@types';
import { estabilishMySQLConnection, pageVisitsQuery } from '../../../utils/sql';

export default function getPageViewsSQL(req: NextApiRequest, res: NextApiResponse) {
  const connection = estabilishMySQLConnection();
  const query = pageVisitsQuery;

  if (req.method === 'GET') {
    connection.query(query, (error, results) => {
      if (error) {
        res.status(500).json({ error: 'An error occurred while querying the database', details: error });
      } else {
        const sqlResults = results as PageViewsSQL[];
        const apiResults: PageViewsAPI[] = sqlResults.map((result) => ({
          id: result.id,
          visitor: result.visitor,
          duration: result.duration,
          pageTitles: result.pageTitles.split(',') as string[],
          visitedUrls: result.pageUrls.split(', ') as string[],
          startTime: new Date(result.startTime),
          totalEvents: result.totalEvents,
          totalActions: result.totalActions,
          totalInteractions: result.totalInteractions,
          operatingSystem: result.operatingSystem,
          deviceScreenSize: {
            width: parseInt(result.deviceScreenSize.split('x')[0]),
            height: parseInt(result.deviceScreenSize.split('x')[1]),
          },
          browserName: result.browserName,
          deviceBrand: result.deviceBrand,
          deviceType: result.deviceType,
        }));
        res.status(200).json(apiResults);
      }
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
