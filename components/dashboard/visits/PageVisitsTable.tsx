import React from 'react'
import { PageViewsAPI } from '../../../@types'
import { TableInteractButtons } from '../../utils'
import classNames from 'classnames'

type Props = {
  visitsData: PageViewsAPI[]
}

export default function PageVisitsTable({ visitsData }: Props) {
  const initialRows = Math.min(5, visitsData.length)
  const [rows, setRows] = React.useState(initialRows)
  const shownData = React.useMemo(() => visitsData.slice(0, rows), [visitsData, rows])

  return (
    <>
      <table className="mt-2 w-full table-auto border border-black bg-lightest dark:border-white dark:bg-navy md:table-fixed">
        <tbody>
          <tr className="border-b border-black bg-primary text-left text-sm text-white shadow dark:border-white dark:bg-secondary/80 md:text-base">
            <th
              title="Total Events"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Evt
            </th>
            <th
              title="Total Actions"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Act
            </th>
            <th
              title="Total Interactions"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Itx
            </th>
            <th
              title="Start Datetime"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Start
            </th>
            <th
              title="Duration (in seconds)"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Duration
            </th>
            <th
              title="Operating System"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              OS
            </th>
            <th
              title="Browser Name"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Browser
            </th>
            <th
              title="Screen Size"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Screen
            </th>
            <th
              title="Device Type"
              className="border-b border-r border-black px-3 py-2 text-center font-normal dark:border-white"
            >
              Device
            </th>
          </tr>
          {shownData.map((item, itemIdx) => {
            const dateString = new Date(item.startTime).toLocaleDateString('pt-PT')
            const timeString = new Date(item.startTime).toLocaleTimeString('pt-PT')
            return (
              <tr
                key={`mouse-click-${itemIdx}`}
                className={classNames(
                  'text-xs tracking-tighter md:text-sm md:tracking-tight',
                  itemIdx % 2 === 0 ? 'bg-lightest dark:bg-darkest' : 'bg-light dark:bg-dark'
                )}
              >
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.totalEvents}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.totalActions}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.totalInteractions}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  <div className="flex flex-col">
                    <span>{dateString}</span>
                    <span>{timeString}</span>
                  </div>
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.duration}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.operatingSystem}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.browserName}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.deviceScreenSize.width}x{item.deviceScreenSize.height}
                </td>
                <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                  {item.deviceType}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <TableInteractButtons data={visitsData} initialRows={initialRows} rowsHook={[rows, setRows]} />
    </>
  )
}
