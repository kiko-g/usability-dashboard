import { CustomAPIError } from '.';

export interface OverviewMatomoResponse {
  nb_visits: number;
  nb_actions: number;
  max_actions: number;
  bounce_count: number;
  sum_visit_length: number;
  nb_visits_new: number;
  nb_actions_new: number;
  max_actions_new: number;
  bounce_rate_new: string;
  nb_actions_per_visit_new: number;
  avg_time_on_site_new: string;
  nb_visits_returning: number;
  nb_actions_returning: number;
  max_actions_returning: number;
  bounce_rate_returning: string;
  nb_actions_per_visit_returning: number;
  avg_time_on_site_returning: string;
  Referrers_visitorsFromSearchEngines: number;
  Referrers_visitorsFromSocialNetworks: number;
  Referrers_visitorsFromDirectEntry: number;
  Referrers_visitorsFromWebsites: number;
  Referrers_visitorsFromCampaigns: number;
  Referrers_distinctSearchEngines: number;
  Referrers_distinctSocialNetworks: number;
  Referrers_distinctKeywords: number;
  Referrers_distinctWebsites: number;
  Referrers_distinctWebsitesUrls: number;
  Referrers_distinctCampaigns: number;
  Referrers_visitorsFromDirectEntry_percent: string;
  Referrers_visitorsFromSearchEngines_percent: string;
  Referrers_visitorsFromCampaigns_percent: string;
  Referrers_visitorsFromSocialNetworks_percent: string;
  Referrers_visitorsFromWebsites_percent: string;
  PagePerformance_network_time: number;
  PagePerformance_network_hits: number;
  PagePerformance_servery_time: number;
  PagePerformance_server_hits: number;
  PagePerformance_transfer_time: number;
  PagePerformance_transfer_hits: number;
  PagePerformance_domprocessing_time: number;
  PagePerformance_domprocessing_hits: number;
  PagePerformance_domcompletion_time: number;
  PagePerformance_domcompletion_hits: number;
  PagePerformance_onload_time: number;
  PagePerformance_onload_hits: number;
  PagePerformance_pageload_time: number;
  PagePerformance_pageload_hits: number;
  avg_time_network: string;
  avg_time_server: string;
  avg_time_transfer: string;
  avg_time_dom_processing: string;
  avg_time_dom_completion: string;
  avg_time_on_load: string;
  avg_page_load_time: string;
  nb_conversions: number;
  nb_visits_converted: number;
  revenue: number;
  conversion_rate: string;
  nb_conversions_new_visit: number;
  nb_visits_converted_new_visit: number;
  revenue_new_visit: number;
  conversion_rate_new_visit: string;
  nb_conversions_returning_visit: number;
  nb_visits_converted_returning_visit: number;
  revenue_returning_visit: number;
  conversion_rate_returning_visit: string;
  nb_pageviews: number;
  nb_uniq_pageviews: number;
  nb_downloads: number;
  nb_uniq_downloads: number;
  nb_outlinks: number;
  nb_uniq_outlinks: number;
  nb_searches: number;
  nb_keywords: number;
  bounce_rate: string;
  nb_actions_per_visit: number;
  avg_time_on_site: string;
}

export interface TransitionMatomo {
  pageUrl: string;
  info:
    | {
        date: string;
        previousPages: { label: string; referrals: number }[];
        previousSiteSearches: string[];
        pageMetrics: {
          loops: number;
          pageviews: number;
          entries: number;
          exits: number;
        };
        followingPages: { label: string; referrals: number }[];
        followingSiteSearches: string[];
        outlinks: string[];
        downloads: string[];
        referrers: { label: string; shortName: string; visits: number; details?: any }[];
      }
    | { result: string; message?: string };
  apiUrl?: string;
}
