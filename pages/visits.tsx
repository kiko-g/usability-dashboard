import React, { Fragment } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { Frequency, Visits } from '../@types';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  Bars3CenterLeftIcon,
  Bars4Icon,
  BarsArrowUpIcon,
  ChevronUpIcon,
  CircleStackIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { mockVisitsData as mockData } from '../utils/mock';
import { Layout } from '../components/layout';
import { Loading, NotFound } from '../components/utils';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { strIncludes } from '../utils';

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
          setData(null);
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
        setData(data === null || data.length === 0 ? null : data);
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
        {data === null ? null : (
          <div className="grid grid-cols-4 gap-4">
            {data.devices && <FrequencyTable title="Devices" freq={data.devices} />}
            {data.os && <FrequencyTable title="Operating System" freq={data.os} />}
            {data.browsers && <FrequencyTable title="Browsers" freq={data.browsers} />}
            {data.screens && <FrequencyTable title="Screen Sizes" freq={data.screens} />}
            <PagesFrequencies data={data} twClasses="col-span-2" />
          </div>
        )}
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
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const pages = React.useMemo(() => (isFlat ? data.pagesFlat : data.pagesExpanded), [data, isFlat]);

  const pagesFiltered = React.useMemo(
    () => (pages ? pages.filter((item) => strIncludes(item.name, searchQuery)) : []),
    [pages, searchQuery]
  );

  function closeModal() {
    setIsModalOpen(false);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function toggleIsFlat() {
    setIsFlat((prev) => !prev);
  }

  return (
    <div
      className={classNames(
        twClasses,
        'relative flex flex-1 flex-col items-start justify-center self-stretch rounded bg-white p-4 dark:bg-darker'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 self-stretch">
        <h2 className="text-xl font-bold tracking-tighter">Pages</h2>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleIsFlat} className="transition hover:opacity-80">
            {isFlat ? <Bars4Icon className="h-5 w-5" /> : <RectangleStackIcon className="h-5 w-5" />}
          </button>
          <button type="button" onClick={openModal} className="transition hover:opacity-80">
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-1 w-full">
        <label htmlFor="email" className="sr-only">
          Search pages
        </label>
        <div className="mt-2 flex rounded-md shadow-sm">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Filter by page name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <ul className="mt-2 flex max-h-72 flex-1 flex-col space-y-2 self-stretch overflow-scroll">
        {pagesFiltered
          .filter((item) => item.value > 0)
          .map((item, itemIdx) => (
            <li
              key={`frequency-${item.name}-${itemIdx}`}
              className="flex items-center justify-between gap-3 rounded bg-slate-100 px-4 py-2.5 text-sm dark:bg-white/10"
            >
              <span className="font-medium tracking-tighter">{item.name}</span>
              <span className="font-mono">{item.value}</span>
            </li>
          ))}
      </ul>

      {/* Expand Pages */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-50 p-6 text-left align-middle shadow-xl transition-all dark:bg-navy">
                  <div className="flex items-center justify-between gap-2">
                    <Dialog.Title
                      as="h3"
                      className="mb-3 text-lg font-bold leading-6 tracking-tighter text-gray-800 dark:text-white"
                    >
                      Top Pages Focus View
                    </Dialog.Title>

                    <div>
                      <button
                        type="button"
                        onClick={toggleIsFlat}
                        className="text-gray-700 transition hover:opacity-80 dark:text-white"
                      >
                        {isFlat ? <Bars4Icon className="h-5 w-5" /> : <RectangleStackIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 font-normal text-gray-700 dark:text-white">
                    {/* Search */}
                    <div className="mb-1 w-full">
                      <label htmlFor="email" className="sr-only">
                        Search pages
                      </label>
                      <div className="mt-2 flex rounded-md shadow-sm">
                        <div className="relative flex flex-grow items-stretch focus-within:z-10">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Filter by page name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>

                    {/* List */}
                    <div className="z-50 mx-auto mt-3 max-h-[60vh] w-full space-y-2 overflow-scroll rounded bg-white p-3 shadow dark:bg-white/5">
                      {pagesFiltered
                        .filter((item) => item.value > 0)
                        .map((item, itemIdx) => (
                          <Disclosure key={`frequency-disclosure-${item.name}-${itemIdx}`}>
                            {({ open }) => (
                              <>
                                <Disclosure.Button className="flex w-full justify-between rounded bg-slate-100 px-4 py-2 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-600 hover:text-white dark:bg-white/20 dark:text-white dark:hover:opacity-80">
                                  <span className="font-medium tracking-tighter">{item.name}</span>
                                  <span className="font-mono">{item.value}</span>
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-2 py-2 text-sm tracking-tighter text-gray-600 dark:text-white">
                                  Inner content
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded bg-slate-600 px-4 py-2 text-sm text-white transition hover:opacity-80 dark:bg-slate-700"
                      onClick={closeModal}
                    >
                      <span>Got it, thanks!</span>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
