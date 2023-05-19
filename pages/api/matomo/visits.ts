import axios from 'axios';
import { config } from '../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError } from '../../../@types';

type ResponseType = any | CustomAPIError;

const requestAndReturn = async (apiUrl: string) => {
  try {
    const response = await axios.get(apiUrl);
    if (response.status !== 200 || response.data.result === 'error') {
      throw { error: 'Error from Matomo API', message: response.data.message };
    }

    return response.data;
  } catch (err: any) {
    throw { error: 'Internal server error', ...err };
  }
};

export default async function getAllEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD
  const pagesApiUrl = `${config.matomoSiteUrl}/index.php?module=API&format=JSON&idSite=${config.matomoSiteId}&period=${period}&date=${date}&method=Actions.getPageUrls&expanded=1&token_auth=${config.matomoToken}&filter_limit=-1`;
  const osApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getOsFamilies&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`;
  const browsersApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getBrowsers&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`;
  const devicesApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=DevicesDetection.getType&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`;
  const screensApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Resolution.getResolution&idSite=${config.matomoSiteId}&period=${period}&date=${date}&format=json&token_auth=${config.matomoToken}&filter_limit=-1`;
  const pageUrlsViewsApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=Actions.getPageUrls&flat=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`;
  const visitsSummaryApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=VisitsSummary.get&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`;

  try {
    const os = await requestAndReturn(osApiUrl);
    const pages = await requestAndReturn(pagesApiUrl);
    const screens = await requestAndReturn(screensApiUrl);
    const devices = await requestAndReturn(devicesApiUrl);
    const browsers = await requestAndReturn(browsersApiUrl);
    const pageUrlsViews = await requestAndReturn(pageUrlsViewsApiUrl);

    return res.status(200).json({ os, pages, screens, devices, browsers, pageUrlsViews, visitsSummaryApiUrl });
  } catch (error) {
    return res.status(500).json(error);
  }
}
