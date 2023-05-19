import React, { Fragment } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { ButtonType } from '../@types';
import { mockButtonData as mockData } from '../utils/mock';
import { Layout } from '../components/layout';
import { CircularProgressBadge, Loading, NotFound } from '../components/utils';
import { Dialog, Disclosure, Listbox, Transition } from '@headlessui/react';
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
  const [data, setData] = React.useState<ButtonType[]>([]); // TODO: replace any with correct type
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
function ButtonKPIs({ data }: { data: ButtonType[] }) {
  if (data.length === 0) return null;

  return (
    <div className="w-full space-y-3 rounded-xl bg-white p-3 dark:bg-darker">
      {data
        .sort((a, b) => (a.buttonClicks > b.buttonClicks ? -1 : 1))
        .map((button, buttonIdx) => (
          <Disclosure key={`button-${buttonIdx}`}>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className={classNames(
                    open
                      ? 'dark:bg-secondary/80 bg-teal-700/80 text-white hover:opacity-90'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:text-white',
                    'dark:bg-secondary/20 dark:hover:bg-secondary/60 group flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium tracking-tighter shadow transition'
                  )}
                >
                  <span>{button.name}</span>
                  <span className="flex items-center gap-2">
                    <span
                      className={classNames(
                        open ? 'border-slate-600 bg-slate-600' : 'border-slate-600 bg-slate-600/60',
                        'inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-full border  px-2 py-1 text-xs font-medium text-white shadow'
                      )}
                    >
                      {button.clickCount}
                    </span>
                  </span>
                </Disclosure.Button>
                <Disclosure.Panel className="dark:bg-white/10 rounded-lg bg-slate-100 px-3 py-3">
                  {button.buttonClicks.map((click, clickIdx) => (
                    <p
                      key={`click-${clickIdx}`}
                      className="font-mono text-xs tracking-tighter text-slate-700 dark:text-white"
                    >
                      {click.path} &middot; {click.time}
                    </p>
                  ))}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
    </div>
  );
}
