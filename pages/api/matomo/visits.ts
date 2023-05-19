import request from 'request';
import { config, requestAndReturn } from '../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError, ITrackerEventGroup } from '../../../@types';

type ResponseType = any | CustomAPIError;

export default function getAllEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const osApiUrl = `${config.matomoSiteUrl}/index.php?module=API&format=JSON&idSite=${config.matomoSiteId}&period=${period}&date=${date}&method=Actions.getPageUrls&expanded=1&token_auth=${config.matomoToken}&filter_limit=-1`;

  const os = requestAndReturn(osApiUrl);

  return res.status(200).json({
    os,
  });
}
