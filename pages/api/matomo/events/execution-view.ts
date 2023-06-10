import axios from 'axios';
import { config, parseEvents } from '../../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError } from '../../../../@types';

type ResponseType = any | CustomAPIError;

export default async function getWizardEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Events.getCategory&secondaryDimension=eventAction&flat=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`;

  try {
    const response = await axios.get(apiUrl);

    if (response.status !== 200 || response.data.result === 'error') {
      return res.status(response.status).json({ error: 'Error from Matomo API', message: response.data.message });
    }

    const executionViews = parseEvents(response.data, 'execution-view');
    return res.status(200).json(executionViews);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}