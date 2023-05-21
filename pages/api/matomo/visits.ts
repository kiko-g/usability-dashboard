import axios from 'axios';
import { config } from '../../../utils/matomo';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { CustomAPIError, Frequency, Visits } from '../../../@types';
import { TransitionMatomo } from '../../../@types/matomo';

type ResponseType = Visits | CustomAPIError;

export default async function getAllEvents(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const period = 'range'; // day, week, month, year, range
  const date = `2023-04-29,today`; // YYYY-MM-DD

  const methods = [
    'DevicesDetection.getOsFamilies',
    'DevicesDetection.getBrowsers',
    'DevicesDetection.getType',
    'Resolution.getResolution',
    'Actions.getPageUrls&expanded=1',
    'Actions.getPageUrls&flat=1',
  ];

  const urls = methods.map(
    (method) =>
      `${config.matomoSiteUrl}/index.php?module=API&method=${method}&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1`
  );

  try {
    const [
      osResponse,
      browsersResponse,
      devicesResponse,
      screensResponse,
      pagesExpandedResponse,
      pageViewsFlatResponse,
    ] = await axios.all(urls.map((url) => axios.get(url)));

    const os = osResponse.data.map((item: any) => ({
      name: item.label,
      value: item.nb_visits,
    }));

    const browsers = browsersResponse.data.map((item: any) => ({
      name: item.label,
      value: item.nb_visits,
    }));

    const devices = devicesResponse.data.map((item: any) => ({
      name: item.label,
      value: item.nb_visits,
    }));

    const screens = screensResponse.data.map((item: any) => ({
      name: item.label,
      value: item.nb_visits,
    }));

    const pagesExpanded = pagesExpandedResponse.data.map((item: any) => ({
      name: item.label.startsWith('/') ? item.label.slice(1) : item.label,
      value: item.nb_visits,
    }));

    const pagesFlat = pageViewsFlatResponse.data.map((item: any) => ({
      name: item.label.startsWith('/') ? item.label.slice(1) : item.label,
      value: item.nb_visits,
    }));

    if ([os, browsers, devices, screens, pagesExpanded, pagesFlat].some((response) => response.result === 'error')) {
      throw {
        error: 'Error from Matomo API',
        message: [pagesExpanded, os, browsers, devices, screens, pagesFlat].find(
          (response) => response.result === 'error'
        )?.message,
      };
    }

    const allPageUrls = pageViewsFlatResponse.data.map((item: any) => item.label);
    const pageUrlApiUrls: string[] = allPageUrls.map(
      (page: string) =>
        `${config.matomoSiteUrl}/index.php?module=API&method=Transitions.getTransitionsForPageUrl&format=json&idSite=${
          config.matomoSiteId
        }&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1&pageUrl=${encodeURIComponent(
          page
        )}`
    );

    const transitionsResponses = await axios.all(pageUrlApiUrls.map((url) => axios.get(url)));
    const transitions: TransitionMatomo[] = transitionsResponses.map((response, responseIdx) => ({
      pageUrl: allPageUrls[responseIdx],
      info: response.data,
    }));

    const overviewApiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=API.get&expanded=1&format=json&idSite=${config.matomoSiteId}&period=${period}&date=${date}&token_auth=${config.matomoToken}&filter_limit=-1&format_metrics=1`;
    const overview = (await axios.get(overviewApiUrl)).data;

    return res.status(200).json({ os, screens, devices, browsers, pagesExpanded, pagesFlat, transitions, overview });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error,
    });
  }
}
