import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { Frequency, Visits } from '../@types';
import { ArrowPathIcon, CircleStackIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { mockVisitsData as mockData } from '../utils/mock';
import { Layout } from '../components/layout';
import { Loading, NotFound } from '../components/utils';

export default function Visits() {
  const [data, setData] = React.useState<Visits | null>(null);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!willFetch) return;

    setError(false);
    setLoading(true);

    fetch('/api/matomo/visits')
      .then((res) => {
        if (!res.ok) {
          setError(true);
          setLoading(false);
          setWillFetch(false);
          return null;
        } else {
          return res.json();
        }
      })
      .then((data: any) => {
        setLoading(false);
        setWillFetch(false);
        setData(data === null ? [] : data);
      });
  }, [willFetch]);

  return (
    <Layout location="Visits">
      <article className="flex flex-col justify-center gap-1">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Site visits</h1>
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <p className="max-w-4xl grow text-lg font-normal">
            Delve into how your users are behaving and inspect the data collected from the page visits and its linked
            data from the sessions.
          </p>

          <div className="flex items-center gap-2">
            {error === false ? null : (
              <button
                title="Use mock data"
                className="hover:opacity-80"
                onClick={() => {
                  setError(false);
                  setData(mockData);
                }}
              >
                <CircleStackIcon className="h-6 w-6" />
              </button>
            )}

            <Link
              target="_blank"
              title="Inspect JSON data"
              href="/api/matomo/events/wizard"
              className="hover:opacity-80"
            >
              <CodeBracketIcon className="h-6 w-6" />
            </Link>

            <button
              title="Retry fetching data"
              className="hover:opacity-80"
              onClick={() => {
                setWillFetch(true);
              }}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading && <Loading />}
        {error && <NotFound />}
        {data === null ? null : <VisitsInsights data={data} />}
      </article>
    </Layout>
  );
}

function FrequencyTable({ twClasses, title, freq }: { twClasses?: string; title: string; freq: Frequency[] }) {
  return (
    <div className={classNames(twClasses, 'flex-1 self-stretch rounded bg-white p-4 dark:bg-darker')}>
      <h2 className="text-xl font-bold tracking-tighter">{title}</h2>
      <ul className="mt-2 flex flex-col space-y-2">
        {freq
          .filter((item) => item.value > 0)
          .map((item, itemIdx) => (
            <li
              key={`frequency-${item.name}-${itemIdx}`}
              className="flex items-center justify-between gap-3 rounded bg-slate-100 px-2 py-2 text-sm dark:bg-white/10"
            >
              <span className="font-medium tracking-tighter">{item.name}</span>
              <span className="font-mono">{item.value}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function PagesFrequencies({ twClasses, data }: { twClasses?: string; data: Visits }) {
  const [isFlat, setIsFlat] = React.useState<boolean>(true);
  const pages = React.useMemo(() => (isFlat ? data.pagesFlat : data.pagesExpanded), [data, isFlat]);

  if (!pages) return null;

  return (
    <div className={classNames(twClasses, 'flex-1 self-stretch rounded bg-white p-4 dark:bg-darker')}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tighter">Pages</h2>
        <button onClick={() => setIsFlat((x) => !x)}></button>
      </div>
      <ul className="mt-2 flex flex-col space-y-2">
        {pages
          .filter((item) => item.value > 0)
          .map((item, itemIdx) => (
            <li
              key={`frequency-${item.name}-${itemIdx}`}
              className="flex items-center justify-between gap-3 rounded bg-slate-100 px-2 py-2 text-sm dark:bg-white/10"
            >
              <span className="font-medium tracking-tighter">{item.name}</span>
              <span className="font-mono">{item.value}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function VisitsInsights({ data }: { data: Visits }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {data.devices && <FrequencyTable title="Devices" freq={data.devices} />}
      {data.os && <FrequencyTable title="Operating System" freq={data.os} />}
      {data.browsers && <FrequencyTable title="Browsers" freq={data.browsers} />}
      {data.screens && <FrequencyTable title="Screen Sizes" freq={data.screens} />}
      <PagesFrequencies data={data} twClasses="col-span-2" />
    </div>
  );
}
