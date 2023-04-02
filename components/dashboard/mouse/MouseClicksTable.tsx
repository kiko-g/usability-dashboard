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
      <TableInteractButtons data={mouseData} rowsHook={[rows, setRows]} initialRows={initialRows} />
    </>
  )
}
