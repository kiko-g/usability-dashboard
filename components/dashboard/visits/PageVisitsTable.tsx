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
  const slicedData = React.useMemo(() => visitsData.slice(0, rows), [visitsData, rows])

  return (
    <>
      <div className="overflow-x-auto">
        <table className="mt-2 w-full table-auto border border-black bg-lightest dark:border-white dark:bg-navy md:table-auto">
          <tbody>
            <tr className="border-b border-black bg-primary text-left text-xs text-white shadow dark:border-white dark:bg-secondary/80 md:text-sm">
              <th title="Start Datetime">Start</th>
              <th title="Duration (in seconds)">Duration</th>
              <th title="Visited Pages">Pages</th>
              <th title="Total Events">Evt</th>
              <th title="Total Actions">Act</th>
              <th title="Total Interactions">Itx</th>
              <th title="Operating System">OS</th>
              <th title="Browser Name">Browser</th>
              <th title="Screen Size">Screen</th>
              <th title="Device Type">Device</th>
            </tr>
            {slicedData.map((item, itemIdx) => {
              const dateString = new Date(item.startTime).toLocaleDateString('pt-PT')
              const timeString = new Date(item.startTime).toLocaleTimeString('pt-PT')

              return (
                <tr
                  title={`Visit #${item.id}`}
                  key={`mouse-click-${itemIdx}`}
                  className={classNames(
                    'group text-xs tracking-tighter md:text-sm md:tracking-tight',
                    itemIdx % 2 === 0 ? 'bg-lightest dark:bg-darkest' : 'bg-light dark:bg-dark'
                  )}
                >
                  <td>
                    <div className="flex flex-col text-xs leading-tight">
                      <span>{dateString}</span>
                      <span>{timeString}</span>
                    </div>
                  </td>
                  <td>{item.duration}s</td>
                  <td className="w-">
                    <div className="flex flex-col gap-y-1.5">
                      {item.visitedUrls.map((page, pageIdx) => (
                        <span key={`page-${pageIdx}`} className="text-xs leading-tight tracking-tighter">
                          {page}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{item.totalEvents}</td>
                  <td>{item.totalActions}</td>
                  <td>{item.totalInteractions}</td>
                  <td>{item.operatingSystem}</td>
                  <td>{item.browserName}</td>
                  <td>
                    {item.deviceScreenSize.width}x{item.deviceScreenSize.height}
                  </td>
                  <td>{item.deviceType}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <TableInteractButtons data={visitsData} initialRows={initialRows} rowsHook={[rows, setRows]} />
    </>
  )
}
