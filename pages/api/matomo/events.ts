import request from 'request';
import { NextApiRequest, NextApiResponse } from 'next';

const siteId = 1;
const matomoUrl = 'http://localhost:80';
const matomoToken = '9a7c2dea66b81a8a903c10a06ebcd5e0';

export default function matomoApiTest(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const period = 'range'; // day, week, month, year, range

    const currentDate = new Date();
    const formattedCurrentDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const date = `2023-01-01,${formattedCurrentDate}`;
    
    const method = 'Events.getCategory';
    const format = 'json';
    const apiUrl = `${matomoUrl}/index.php?module=API&method=${method}&expanded=1&format=${format}&idSite=${siteId}&period=${period}&date=${date}&token_auth=${matomoToken}`;

    request(apiUrl, { json: true }, (err, response, body) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (response.statusCode !== 200 || body.result === 'error') {
        return res.status(response.statusCode).json({ error: 'Error from Matomo API', message: body.message });
      }

      const data = [];
      const events = Array.isArray(body) ? body : JSON.parse(body);
      if (!events) {
        return res.status(200).json([]);
      }

      for (const event of events) {
        const meta = JSON.parse(event.label);
        meta.action = event.subtable[0].label;
        data.push(meta);
      }

      return res.status(200).json(data);
    });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
