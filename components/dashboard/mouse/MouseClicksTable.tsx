import React from 'react'
import classNames from 'classnames'
import { MouseClicksAPI } from '../../../@types'
import { TableInteractButtons } from '../../utils'

type Props = {
  mouseData: MouseClicksAPI[]
}

export default function MouseClicksTable({ mouseData }: Props) {
  const initialRows = Math.min(10, mouseData.length)
  const [rows, setRows] = React.useState(initialRows)
  const shownData = React.useMemo(() => mouseData.slice(0, rows), [mouseData, rows])

  return (
    <>
      <div className="overflow-x-auto">
        <table className="mt-2 w-full table-auto border border-black bg-lightest dark:border-white dark:bg-navy md:table-fixed">
          <tbody>
            <tr className="border-b border-black bg-primary text-left text-xs text-white shadow dark:border-white dark:bg-secondary/80 md:text-sm">
              <th title="Mouse Click X Coordinate">X</th>
              <th title="Mouse Click X Coordinate">Y</th>
              <th title="Mouse Click Datetime">Date</th>
            </tr>
            {shownData.map((item, itemIdx) => {
              const dateString = new Date(item.date).toLocaleDateString('pt-PT')
              const timeString = new Date(item.date).toLocaleTimeString('pt-PT')
              return (
                <tr
                  key={`mouse-click-${itemIdx}`}
                  className={classNames(
                    'group text-xs tracking-tighter md:text-sm md:tracking-tight',
                    itemIdx % 2 === 0 ? 'bg-lightest dark:bg-darkest' : 'bg-light dark:bg-dark'
                  )}
                >
                  <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">{item.x}</td>
                  <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">{item.y}</td>
                  <td className="border-b border-r border-black px-3 py-1 text-center dark:border-white">
                    <div className="flex flex-col">
                      <span>{dateString}</span>
                      <span>{timeString}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <TableInteractButtons data={mouseData} rowsHook={[rows, setRows]} initialRows={initialRows} />
    </>
  )
}
