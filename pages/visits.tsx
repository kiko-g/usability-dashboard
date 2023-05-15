import React from 'react';
import type { PageViewsAPI, PageVisitsVizTypeFilter, PieData } from '../@types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Layout } from '../components/layout';
import { Loading, NotFound, PieChart } from '../components/utils';
import { PageVisitsTable, SelectPageVisitsType } from '../components/dashboard/visits';

export default function Visits() {
  return (
    <Layout location="Visits">
      <main>
        <article className="flex flex-col justify-center gap-1">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Site visits</h1>
          <p className="mb-2 max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the page visits and its linked
            data from the sessions.
          </p>
        </article>
        <PageVisitsViz />
      </main>
    </Layout>
  );
}

function PageVisitsViz() {
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  const [data, setData] = React.useState<PageViewsAPI[]>([]);
  const [vizType, setVizType] = React.useState<PageVisitsVizTypeFilter>({ name: 'All', value: 'all' });
  const seeAll = React.useMemo<boolean>(() => vizType.value === 'all', [vizType]);

  // create pages frequencies
  const visitedPagesFreqs = React.useMemo<PieData[]>(() => {
    const pagesFreq = data.map((item) => item.visitedUrls).flat();
    const pagesCount = pagesFreq.reduce<Record<string, number>>((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(pagesCount).map(([name, count]) => ({ name, count }));
  }, [data]);

  // create browsers frequencies
  const browserFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const browser = curr.browserName;
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }));
  }, [data]);

  // create device type frequencies
  const deviceFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const device = curr.deviceType;
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }));
  }, [data]);

  // create screen width*height frequencies
  const screenFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const screen = curr.deviceScreenSize;
      const screenStr = `${screen.width}x${screen.height}`;
      acc[screenStr] = (acc[screenStr] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }));
  }, [data]);

  // create operating system usage frequencies
  const osFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const os = curr.operatingSystem;
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }));
  }, [data]);

  React.useEffect(() => {
    if (!willFetch) return;

    fetch('/api/matomo/visits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PageViewsAPI[]) => {
        if (data === null) {
          setData([]);
          setError(true);
          setLoading(false);
          setWillFetch(false);
        } else {
          setData(data);
          setError(false);
          setLoading(false);
          setWillFetch(false);
        }
      });
  }, [willFetch]);

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="space-y-3">
        <NotFound />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              setWillFetch(true);
            }}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-white transition hover:opacity-80"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span className="text-sm">Fetch again</span>
          </button>
        </div>
      </div>
    );

  return data.length === 0 ? (
    <div className="mt-2 rounded border bg-black/20 p-4 dark:bg-white/20">No Page Visits Data Found.</div>
  ) : (
    <section className="mt-2 flex flex-col space-y-4">
      <div className="flex flex-col items-end justify-end gap-2 md:flex-row">
        <SelectPageVisitsType pickedHook={[vizType, setVizType]} />
      </div>

      <div className="flex flex-col space-y-8">
        {vizType.value === 'urls' || seeAll ? (
          <PieChart data={visitedPagesFreqs} title="Visited URLs Pie Chart" />
        ) : null}
        {vizType.value === 'browsers' || seeAll ? (
          <PieChart data={browserFreqs} title="Browser Usage Pie Chart" />
        ) : null}
        {vizType.value === 'devices' || seeAll ? <PieChart data={deviceFreqs} title="Devices Type Pie Chart" /> : null}
        {vizType.value === 'screens' || seeAll ? <PieChart data={screenFreqs} title="Screen Sizes Pie Chart" /> : null}
        {vizType.value === 'os' || seeAll ? <PieChart data={osFreqs} title="Operating Systems Pie Chart" /> : null}
        {vizType.value === 'table' || seeAll ? <PageVisitsTable visitsData={data} /> : null}
      </div>
    </section>
  );
}
