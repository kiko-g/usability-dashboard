import React, { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';
import { Dialog, Disclosure, Listbox, Transition } from '@headlessui/react';
import type { Frequency, Visits } from '@/@types';
import type { OverviewMatomoResponse, TransitionMatomo } from '@/@types/matomo';

import { strIncludes } from '@/utils';
import { mockVisitsData as mockData } from '@/utils/mock';

import { Layout } from '@/components/layout';
import { Loading, NotFound } from '@/components/utils';

import {
  ArrowLongDownIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowLongUpIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  Bars4Icon,
  CheckCircleIcon,
  ChevronUpDownIcon,
  CircleStackIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { ArrowTopRightOnSquareIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

export default function Visits() {
  const [data, setData] = React.useState<Visits | null>(null);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  const fetchData = () => {
    setError(false);
    setLoading(true);

    // change to '/api/matomo/visits/transitions' to include transitions
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
      .then((data: Visits) => {
        setLoading(false);
        setWillFetch(false);
        if (data !== null) setData(data);
      });
  };

  React.useEffect(() => {
    if (!willFetch) return;
    fetchData();
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

            <Link target="_blank" title="Inspect JSON data" href="/api/matomo/visits" className="hover:opacity-80">
              <CodeBracketIcon className="h-6 w-6" />
            </Link>

            {/* View JSON button */}
            <button
              title="View JSON data"
              className="hover:opacity-80"
              onClick={() => {
                const jsonString = JSON.stringify(data);
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
                window.open(dataUri, '_blank');
              }}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6">
                <path d="M5.759 3.975h1.783V5.76H5.759v4.458A1.783 1.783 0 0 1 3.975 12a1.783 1.783 0 0 1 1.784 1.783v4.459h1.783v1.783H5.759c-.954-.24-1.784-.803-1.784-1.783v-3.567a1.783 1.783 0 0 0-1.783-1.783H1.3v-1.783h.892a1.783 1.783 0 0 0 1.783-1.784V5.76A1.783 1.783 0 0 1 5.76 3.975m12.483 0a1.783 1.783 0 0 1 1.783 1.784v3.566a1.783 1.783 0 0 0 1.783 1.784h.892v1.783h-.892a1.783 1.783 0 0 0-1.783 1.783v3.567a1.783 1.783 0 0 1-1.783 1.783h-1.784v-1.783h1.784v-4.459A1.783 1.783 0 0 1 20.025 12a1.783 1.783 0 0 1-1.783-1.783V5.759h-1.784V3.975h1.784M12 14.675a.892.892 0 0 1 .892.892.892.892 0 0 1-.892.892.892.892 0 0 1-.891-.892.892.892 0 0 1 .891-.892m-3.566 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892m7.133 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892z"></path>
              </svg>
            </button>

            <button title="Retry fetching data" className="hover:opacity-80" onClick={() => fetchData()}>
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading && <Loading />}
        {error && <NotFound />}
        {data === null ? null : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <PagesFrequencies data={data} twClasses="col-span-1 lg:col-span-2" />
              <VisitsSummary overview={data.overview} twClasses="col-span-1 lg:col-span-1" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.devices && <FrequencyTable title="Devices" freq={data.devices} />}
              {data.os && <FrequencyTable title="Operating System" freq={data.os} />}
              {data.browsers && <FrequencyTable title="Browsers" freq={data.browsers} />}
              {data.screens && <FrequencyTable title="Screen Sizes" freq={data.screens} />}
            </div>
            <PageTransitionsMatomoLink />
          </div>
        )}
      </article>
    </Layout>
  );
}

function FrequencyTable({ twClasses, title, freq }: { twClasses?: string; title: string; freq: Frequency[] }) {
  const total = freq.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className={classNames(twClasses, 'flex-1 self-stretch rounded bg-white p-4 dark:bg-darker')}>
      <h2 className="text-xl font-bold tracking-tighter">{title}</h2>
      <ul className="mt-2 flex max-h-40 flex-col space-y-2 overflow-y-scroll">
        {freq
          .filter((item) => item.value > 0)
          .map((item, itemIdx) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <li
                key={`frequency-${item.name}-${itemIdx}`}
                className="flex items-center justify-between gap-3 rounded bg-slate-100 px-2 py-2 text-sm dark:bg-white/10"
              >
                <span className="font-medium tracking-tighter">{item.name}</span>
                <span className="whitespace-nowrap font-mono tracking-tighter">
                  ({percentage}%) <span className="font-bold">{item.value}</span>
                </span>
              </li>
            );
          })}
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

  const total = React.useMemo(() => pagesFiltered.reduce((acc, curr) => acc + curr.value, 0), [pagesFiltered]);

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
        'relative flex flex-1 flex-col items-start justify-start self-stretch rounded bg-white p-4 dark:bg-darker'
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
      <div className="w-full">
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
      <ul className="mt-2 flex max-h-[300px] flex-1 flex-col space-y-2 self-stretch overflow-y-scroll">
        {pagesFiltered.length === 0 ? (
          <li className="text-sm">No match.</li>
        ) : (
          pagesFiltered
            .filter((item) => item.value > 0)
            .map((item, itemIdx) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <li
                  key={`frequency-${item.name}-${itemIdx}`}
                  className="flex items-center justify-between gap-3 rounded bg-slate-100 px-4 py-2.5 text-sm dark:bg-white/10"
                >
                  <span className="wrap truncate font-medium tracking-tighter">{item.name}</span>
                  <span className="whitespace-nowrap font-mono tracking-tighter">
                    ({percentage}%) <span className="font-bold">{item.value}</span>
                  </span>
                </li>
              );
            })
        )}
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur dark:bg-white/10" />
          </Transition.Child>

          <div className="fixed right-0 top-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex h-screen w-full transform flex-col justify-between gap-4 overflow-scroll bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-navy md:min-w-[32rem] md:max-w-3xl">
                  <div>
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
                      <div className="z-50 mx-auto mt-3 max-h-[70vh] w-full space-y-2 overflow-y-scroll rounded bg-white dark:bg-white/5">
                        {pagesFiltered
                          .filter((item) => item.value > 0)
                          .map((item, itemIdx) => {
                            const percentage = ((item.value / total) * 100).toFixed(1);
                            return (
                              <Disclosure key={`frequency-disclosure-${item.name}-${itemIdx}`}>
                                {({ open }) => (
                                  <>
                                    <Disclosure.Button className="flex w-full justify-between gap-6 rounded bg-slate-100 px-4 py-2 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-600 hover:text-white dark:bg-white/20 dark:text-white dark:hover:opacity-80">
                                      <span className="font-medium tracking-tighter">{item.name}</span>
                                      <span className="whitespace-nowrap font-mono tracking-tighter">
                                        ({percentage}%) <span className="font-bold">{item.value}</span>
                                      </span>
                                    </Disclosure.Button>
                                    <Disclosure.Panel className="px-2 py-2 text-sm tracking-tighter text-gray-600 dark:text-white">
                                      Inner content
                                    </Disclosure.Panel>
                                  </>
                                )}
                              </Disclosure>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 bg-teal-600/20 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-600 hover:text-white"
                      onClick={closeModal}
                    >
                      <span>Roger that</span>
                      <CheckCircleSolidIcon className="h-5 w-5" />
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

function VisitsSummary({ twClasses, overview }: { twClasses?: string; overview: OverviewMatomoResponse }) {
  const {
    nb_visits: visitCount,
    nb_uniq_pageviews: uniquePageviews,
    avg_time_on_site: avgVisitTime,
    nb_actions_per_visit: actionsPerVisit,
    nb_pageviews: pageviewsCount,
    max_actions: maxActions,
    bounce_rate: bounceRate,
  } = overview;

  const summary = [
    { text: 'Total Visits', value: visitCount },
    { text: 'Total Pageviews', value: pageviewsCount },
    { text: 'Bounce Visit Rate', value: bounceRate },
    { text: 'Unique Pageviews', value: uniquePageviews },
    { text: 'Avg Visit Duration', value: avgVisitTime.toString().replace(/\s/g, '') },
    { text: 'Avg Actions Per Visit', value: actionsPerVisit },
    { text: 'Max Actions Per Visit', value: maxActions },
    { text: 'Total Pageviews', value: pageviewsCount },
  ];

  return (
    <div
      className={classNames(
        twClasses,
        'relative flex flex-1 flex-col items-start justify-start self-stretch rounded bg-white p-4 dark:bg-darker'
      )}
    >
      <div className="flex items-center justify-between gap-2 self-stretch">
        <h2 className="text-xl font-bold tracking-tighter">Visits Summary</h2>
        <div className="flex items-center gap-2"></div>
      </div>

      <ul className="mt-2 flex flex-1 flex-col space-y-2 self-stretch overflow-y-scroll">
        {summary.map((item, itemIdx) => (
          <li
            key={`summary-${itemIdx}`}
            className="flex items-center justify-between gap-2 rounded bg-slate-100 px-3 py-2 dark:bg-white/10"
          >
            <span className="trac flex items-center gap-1.5 text-sm tracking-tighter">
              <span className="block h-3.5 w-3.5 rounded-full bg-slate-700 dark:bg-slate-400" />
              <span>{item.text}</span>
            </span>

            <span className="font-mono text-sm font-medium tracking-tighter">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PageTransitionsMatomoLink() {
  return (
    <Link
      target="_blank"
      title="Check Page Transitions on the Matomo Dashboard"
      href={
        process.env.NEXT_PUBLIC_MATOMO_DASHBOARD_URL ||
        'http://localhost:8089/index.php?module=CoreHome&action=index&idSite=1&period=day&date=today#?idSite=1&period=day&date=yesterday&category=General_Actions&subcategory=Transitions_Transitions'
      }
      className="group flex items-center justify-between gap-3 rounded-lg border border-transparent bg-white p-6 transition hover:bg-gray-100 dark:border-secondary/50 dark:bg-secondary/20 dark:hover:bg-secondary/50"
    >
      <div className="flex items-center justify-center gap-3">
        <Image src="/matomo.png" alt="Matomo Icon" width={64} height={64} className="rounded-full bg-gray-100 p-2" />
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-slate-700 dark:text-white">
            Check Page Transitions on the Matomo Dashboard
          </h3>
          <p className="mt-1 max-w-[80%] text-sm text-gray-500 dark:text-gray-200">
            Page Transitions are better described directly on the Matomo Dashboard. Click here to check them out.
          </p>
        </div>
      </div>

      <div>
        <ArrowTopRightOnSquareIcon className="h-8 w-8 transition group-hover:scale-125" />
      </div>
    </Link>
  );
}

function PageTransitionSummary({ twClasses, transitions }: { twClasses?: string; transitions: TransitionMatomo[] }) {
  const options = transitions.map((item) => item);
  const [picked, setPicked] = React.useState(options[0]);

  return (
    <div
      className={classNames(
        twClasses,
        'relative flex flex-1 flex-col items-start justify-start self-stretch rounded bg-white p-4 dark:bg-darker'
      )}
    >
      <div className="flex items-center justify-between gap-2 self-stretch">
        <h2 className="text-xl font-bold tracking-tighter">Transitions</h2>
        <div className="flex items-center gap-2">
          <Listbox value={picked} onChange={setPicked}>
            <div className="relative w-full min-w-full lg:w-auto lg:min-w-[15rem]">
              <Listbox.Button
                as="button"
                className="inline-flex w-full items-center justify-center gap-x-1 rounded border border-primary bg-primary/50 py-2 pl-3 pr-2 text-center text-sm font-medium tracking-tight text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary dark:bg-secondary/50 dark:hover:bg-secondary/80 lg:px-2 lg:py-1.5"
              >
                <span className="block truncate text-sm font-normal">{picked.pageUrl}</span>
                <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-gray-100 py-2 shadow lg:w-full">
                  {options.map((option: TransitionMatomo, optionIdx: number) => {
                    return (
                      <Listbox.Option
                        key={`option-${optionIdx}`}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-1.5 pl-10 pr-5 text-sm font-normal tracking-tight ${
                            active
                              ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                              : 'text-gray-800'
                          }`
                        }
                        value={option}
                      >
                        <span
                          className={`block truncate ${
                            option.pageUrl === picked.pageUrl ? 'font-semibold' : 'font-normal'
                          }`}
                        >
                          {option.pageUrl}
                        </span>
                        {picked.pageUrl === option.pageUrl ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary dark:text-secondary">
                            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-3 truncate font-normal tracking-tighter xl:flex-row">
        <div className="flex flex-1 flex-col justify-start space-y-3 self-stretch">
          {picked.info === null || picked.info.previousPages.length === 0 ? (
            <span className="flex items-center justify-center gap-2 truncate rounded bg-rose-600/20 px-3 py-2 dark:bg-rose-600/30">
              No previous pages
            </span>
          ) : (
            picked.info.previousPages.map((page, pageIdx) => (
              <span
                key={`transition-prevpage-${pageIdx}`}
                className="flex items-center justify-between gap-2 truncate rounded border-l-4 border-primary bg-slate-100 px-3 py-2 dark:border-secondary dark:bg-white/10"
              >
                <span className="font-mono text-xs tracking-tighter">{page.label.replace('localhost', '')}</span>
                <ArrowLongRightIcon className="hidden h-5 w-5 xl:flex" />
                <ArrowLongDownIcon className="flex h-5 w-5 xl:hidden" />
              </span>
            ))
          )}
        </div>

        <div className="flex flex-col items-center justify-center truncate rounded bg-slate-100 px-6 py-6 dark:bg-white/10">
          <span className="font-mono text-xs tracking-tighter">{picked.pageUrl}</span>
        </div>

        <div className="flex flex-1 flex-col justify-start space-y-3">
          {picked.info === null || picked.info.followingPages.length === 0 ? (
            <span className="flex items-center justify-center gap-2 truncate rounded bg-rose-600/20 px-3 py-2 dark:bg-rose-600/30">
              No following pages
            </span>
          ) : (
            picked.info.followingPages.map((page, pageIdx) => (
              <span
                key={`transition-nextpage-${pageIdx}`}
                className="flex items-center justify-between gap-2 truncate rounded border-r-4 border-primary bg-slate-100 px-3 py-2 dark:border-secondary dark:bg-white/10"
              >
                <ArrowLongLeftIcon className="hidden h-5 w-5 xl:flex" />
                <ArrowLongUpIcon className="flex h-5 w-5 xl:hidden" />
                <span className="font-mono text-xs tracking-tighter">{page.label.replace('localhost', '')}</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
