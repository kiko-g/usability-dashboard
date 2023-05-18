import React, { Fragment } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { IWizardGroup } from '../@types';
import { mockWizardData as mockData } from '../utils/mock';
import { Layout } from '../components/layout';
import { CircularProgressBadge, Loading, NotFound } from '../components/utils';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { WizardAction } from '../utils/matomo';
import {
  ArrowPathIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  CircleStackIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function Buttons() {
  const [data, setData] = React.useState<any>([]); // TODO: replace any with correct type
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!willFetch) return;

    setError(false);
    setLoading(true);

    fetch('/api/matomo/events/button')
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
        // TODO: replace any with correct type
        setLoading(false);
        setWillFetch(false);
        setData(data === null ? [] : data);
      });
  }, [willFetch]);

  return (
    <Layout location="Buttons">
      <article className="flex flex-col justify-center gap-1">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Button Insights</h1>
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <p className="max-w-4xl grow text-lg font-normal">
            Inspect how your users are using the <span className="font-bold underline">buttons</span> across the
            platform.
          </p>

          <div className="flex items-center gap-2">
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

            <Link
              target="_blank"
              title="Inspect JSON data"
              href="/api/matomo/events/button"
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

        <ButtonKPIs data={data} />
        {loading && <Loading />}
        {error && <NotFound />}
      </article>
    </Layout>
  );
}

// TODO: replace any with correct type
function ButtonKPIs({ data }: { data: any }) {
  if (data.length === 0) return null;

  return (
    <div>
      <div></div>
    </div>
  );
}
