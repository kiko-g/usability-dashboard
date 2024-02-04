import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import type { ButtonType } from '@/@types'
import { Disclosure } from '@headlessui/react'
import { mockButtonData as mockData } from '@/utils/mock'

import { Layout } from '@/components/layout'
import { Loading, NotFound } from '@/components/utils'

import { ArrowPathIcon, CircleStackIcon, CodeBracketIcon } from '@heroicons/react/24/outline'

export default function Buttons() {
  const [data, setData] = React.useState<ButtonType[]>([])
  const [error, setError] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [willFetch, setWillFetch] = React.useState<boolean>(true)

  React.useEffect(() => {
    if (!willFetch) return

    setError(false)
    setLoading(true)

    fetch('/api/matomo/events/button')
      .then((res) => {
        if (!res.ok) {
          setError(true)
          setLoading(false)
          setData(mockData)
          setWillFetch(false)
          return mockData
        } else {
          return res.json()
        }
      })
      .then((data: any) => {
        // TODO: replace any with correct type
        setLoading(false)
        setWillFetch(false)
        setData(data === null ? [] : data)
      })
  }, [willFetch])

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
            {error === false || data !== null ? null : (
              <button
                title="Use mock data"
                className="hover:opacity-80"
                onClick={() => {
                  setError(false)
                  setData(mockData)
                }}
              >
                <CircleStackIcon className="h-6 w-6" />
              </button>
            )}

            <Link
              target="_blank"
              title="Inspect JSON data"
              href="/api/matomo/events/button"
              className="hover:opacity-80"
            >
              <CodeBracketIcon className="h-6 w-6" />
            </Link>

            {/* View JSON button */}
            <button
              title="View JSON data"
              className="hover:opacity-80"
              onClick={() => {
                const jsonString = JSON.stringify(data)
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`
                window.open(dataUri, '_blank')
              }}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6">
                <path d="M5.759 3.975h1.783V5.76H5.759v4.458A1.783 1.783 0 0 1 3.975 12a1.783 1.783 0 0 1 1.784 1.783v4.459h1.783v1.783H5.759c-.954-.24-1.784-.803-1.784-1.783v-3.567a1.783 1.783 0 0 0-1.783-1.783H1.3v-1.783h.892a1.783 1.783 0 0 0 1.783-1.784V5.76A1.783 1.783 0 0 1 5.76 3.975m12.483 0a1.783 1.783 0 0 1 1.783 1.784v3.566a1.783 1.783 0 0 0 1.783 1.784h.892v1.783h-.892a1.783 1.783 0 0 0-1.783 1.783v3.567a1.783 1.783 0 0 1-1.783 1.783h-1.784v-1.783h1.784v-4.459A1.783 1.783 0 0 1 20.025 12a1.783 1.783 0 0 1-1.783-1.783V5.759h-1.784V3.975h1.784M12 14.675a.892.892 0 0 1 .892.892.892.892 0 0 1-.892.892.892.892 0 0 1-.891-.892.892.892 0 0 1 .891-.892m-3.566 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892m7.133 0a.892.892 0 0 1 .891.892.892.892 0 0 1-.891.892.892.892 0 0 1-.892-.892.892.892 0 0 1 .892-.892z"></path>
              </svg>
            </button>

            <button
              title="Retry fetching data"
              className="hover:opacity-80"
              onClick={() => {
                setWillFetch(true)
              }}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <ButtonKPIs data={data} />
        {loading && <Loading />}
        {error && data === null && <NotFound />}
      </article>
    </Layout>
  )
}

function ButtonKPIs({ data }: { data: ButtonType[] }) {
  const totalClicks = data.reduce((result, button) => result + button.buttonClicks.length, 0)
  if (data.length === 0) return null

  return (
    <div className="w-full space-y-3 rounded-xl bg-white p-3 dark:bg-darker">
      {data
        .sort((a, b) => (a.buttonClicks > b.buttonClicks ? -1 : 1))
        .map((button, buttonIdx) => {
          // group by where each click occurred
          const pathOccurrences: { [path: string]: number } = button.buttonClicks.reduce<{ [path: string]: number }>(
            (result, click) => {
              const { path } = click
              if (!result[path]) result[path] = 0
              result[path]++
              return result
            },
            {}
          )

          const uniquePaths = Object.keys(pathOccurrences).sort((a, b) =>
            pathOccurrences[a] > pathOccurrences[b] ? -1 : 1
          )

          return (
            <Disclosure key={`button-${buttonIdx}`}>
              {({ open }) => (
                <>
                  <Disclosure.Button
                    className={classNames(
                      open
                        ? 'bg-teal-700/80 text-white hover:opacity-90 dark:bg-secondary/80'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:text-white',
                      'group flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-medium tracking-tighter shadow transition dark:bg-secondary/20 dark:hover:bg-secondary/60'
                    )}
                  >
                    <span>{button.name}</span>
                    <span className="flex items-center gap-2">
                      <span
                        className={classNames(
                          open ? 'border-slate-600 bg-slate-600' : 'border-slate-600 bg-slate-600/60',
                          'inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded border  px-2 py-1 text-xs font-medium text-white shadow'
                        )}
                      >
                        {((100 * button.clickCount) / totalClicks).toFixed(0)}%
                      </span>

                      <span
                        className={classNames(
                          open ? 'border-slate-600 bg-slate-600' : 'border-slate-600 bg-slate-600/60',
                          'inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded border  px-2 py-1 text-xs font-medium text-white shadow'
                        )}
                      >
                        {button.clickCount}
                      </span>
                    </span>
                  </Disclosure.Button>
                  <Disclosure.Panel className="z-20 rounded-lg bg-slate-100 px-3 py-3 dark:bg-white/10">
                    <div className="flex flex-col">
                      {uniquePaths.map((path, pathIdx) => (
                        <div className="flex w-full flex-col space-y-1" key={`path-${pathIdx}`}>
                          <div
                            className={classNames(
                              'w-full self-stretch transition',
                              'flex items-center justify-between gap-x-8 px-1 py-1 font-mono text-xs tracking-tighter text-slate-700 dark:text-white',
                              pathIdx !== uniquePaths.length - 1
                                ? 'border-b border-primary/40 dark:border-secondary/40'
                                : ''
                            )}
                          >
                            <span className="flex items-center gap-x-1">
                              {/* <ChevronDownIcon className="h-4 w-4" /> */}
                              <span className="truncate whitespace-nowrap tracking-tighter">{path}</span>
                            </span>
                            <span>{pathOccurrences[path]}</span>
                          </div>

                          <ul className="hidden">
                            {button.buttonClicks
                              .filter((b) => b.path === path)
                              .map((click, clickIdx) => {
                                return (
                                  <li
                                    key={`button-${buttonIdx}-path-${pathIdx}-click-${clickIdx}`}
                                    className="flex items-center justify-between gap-1 font-mono text-xxs tracking-tighter"
                                  >
                                    <span>{click.time}</span>
                                    <span>{click.component}</span>
                                  </li>
                                )
                              })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          )
        })}
    </div>
  )
}
