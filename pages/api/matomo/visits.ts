import request from 'request';
import { config, requestAndReturn } from '../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError } from '../../../@types';

type ResponseType = any | CustomAPIError;

export default async function getAllEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const pagesApiUrl = `${config.matomoSiteUrl}/index.php?module=API&format=JSON&idSite=${config.matomoSiteId}&period=${period}&date=${date}&method=Actions.getPageUrls&expanded=1&token_auth=${config.matomoToken}&filter_limit=-1`;
  const osApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getOsFamilies&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;
  const browsersApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getBrowsers&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;
  const screensApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Resolution.getResolution&idSite=${config.matomoSiteId}&period=${period}&date=${date}&format=json&token_auth=${config.matomoToken}`;
  const pageViewsApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=VisitsSummary.get&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}`;

  try {
    const os = await requestAndReturn(osApiUrl);
    const pages = await requestAndReturn(pagesApiUrl);
    const screens = await requestAndReturn(screensApiUrl);
    const browsers = await requestAndReturn(browsersApiUrl);
    const pageViews = await requestAndReturn(pageViewsApiUrl);

    return res.status(200).json({ os, pages, screens, browsers, pageViews });
  } catch (error) {
    return res.status(500).json(error);
  }
}
