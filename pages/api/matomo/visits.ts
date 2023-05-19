import axios from 'axios';
import { config } from '../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError, Visits } from '../../../@types';

type ResponseType = Visits | CustomAPIError;

export default async function getAllEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD

  const methods = [
    'Actions.getPageUrls&expanded=1',
    'DevicesDetection.getOsFamilies',
    'DevicesDetection.getBrowsers',
    'DevicesDetection.getType',
    'Resolution.getResolution',
    'Actions.getPageUrls&flat=1',
  ];

  const urls = methods.map(
    (method) =>
      `${config.matomoSiteUrl}/index.php?module=API&method=${method}&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`
  );

  try {
    const [pagesResponse, osResponse, browsersResponse, devicesResponse, screensResponse, pageUrlsViewsResponse] =
      await axios.all(urls.map((url) => axios.get(url)));

    const pages = pagesResponse.data.map((os: any) => ({
      name: os.label,
      value: os.nb_visits,
    }));
    const os = osResponse.data.map((os: any) => ({
      name: os.label,
      value: os.nb_visits,
    }));
    const browsers = browsersResponse.data.map((os: any) => ({
      name: os.label,
      value: os.nb_visits,
    }));
    const devices = devicesResponse.data.map((os: any) => ({
      name: os.label,
      value: os.nb_visits,
    }));
    const screens = screensResponse.data.map((os: any) => ({
      name: os.label,
      value: os.nb_visits,
    }));
    const pageUrlsViews = pageUrlsViewsResponse.data;

    if ([pages, os, browsers, devices, screens, pageUrlsViews].some((response) => response.result === 'error')) {
      throw {
        error: 'Error from Matomo API',
        message: [pages, os, browsers, devices, screens, pageUrlsViews].find((response) => response.result === 'error')
          ?.message,
      };
    }

    return res.status(200).json({ os, pages, screens, devices, browsers, pageUrlsViews });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error,
    });
  }
}
