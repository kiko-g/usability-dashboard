import React from 'react'
import classNames from 'classnames'
import { MouseClicksAPI } from '../../../@types'
import { ArrowDownCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

type Props = {
  mouseData: MouseClicksAPI[]
}

export default function MouseClicksTable({ mouseData }: Props) {
  const [rowCount, setRowCount] = React.useState(10)
  const shownData = React.useMemo(() => mouseData.slice(0, rowCount), [mouseData, rowCount])

  return (
    <>
      <table className="mt-2 w-full table-auto border border-black bg-lightest dark:border-white dark:bg-navy md:table-fixed">
        <tbody>
          <tr className="border-b border-black bg-primary text-left text-sm text-white shadow dark:border-white dark:bg-secondary/80 md:text-base">
            <th className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white">X</th>
            <th className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white">Y</th>
            <th className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white">Date</th>
          </tr>
          {shownData.map((mouseClick, mouseClickIdx) => (
            <tr
              key={`mouse-click-${mouseClickIdx}`}
              className={classNames(
                'text-xs md:text-sm',
                mouseClickIdx % 2 === 0 ? 'bg-lightest dark:bg-darkest' : 'bg-light dark:bg-dark'
              )}
            >
              <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">{mouseClick.x}</td>
              <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">{mouseClick.y}</td>
              <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                {mouseClick.date.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rowCount < mouseData.length && (
        <div className="mt-2 flex flex-row justify-center gap-3">
          <button
            className="flex w-full items-center justify-center gap-1.5 rounded border border-primary bg-primary/50 px-4 py-2 text-sm font-normal text-white shadow-md transition hover:bg-primary hover:bg-primary/80 dark:border-secondary dark:bg-secondary/50 dark:hover:bg-secondary"
            onClick={() => setRowCount(rowCount + Math.floor(0.1 * mouseData.length))}
          >
            <span>
              Show more ({rowCount}/{mouseData.length})
            </span>
            <PlusCircleIcon className="h-5 w-5" />
          </button>

          <button
            className="flex w-full items-center justify-center gap-1.5 rounded border border-primary bg-primary/50 px-4 py-2 text-sm font-normal text-white shadow-md transition hover:bg-primary hover:bg-primary/80 dark:border-secondary dark:bg-secondary/50 dark:hover:bg-secondary"
            onClick={() => setRowCount(mouseData.length)}
          >
            <span>Show all {mouseData.length} rows</span>
            <ArrowDownCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  )
}
