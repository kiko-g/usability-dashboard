import React from 'react'
import classNames from 'classnames'
import { MouseClicksAPI } from '../../@types'

type Props = {
  mouseData: MouseClicksAPI[]
}

export default function MouseClicksTable({ mouseData }: Props) {
  return (
    <table className="mt-2 w-full table-auto border border-black bg-lightest dark:border-white dark:bg-navy md:table-fixed">
      <tbody>
        <tr className="border-b border-black bg-primary text-left text-sm text-white shadow dark:border-white dark:bg-secondary/80 md:text-base">
          <th className="border-b border-r border-black px-3 py-3 text-center font-normal dark:border-white">X</th>
          <th className="border-b border-r border-black px-3 py-3 text-center font-normal dark:border-white">Y</th>
          <th className="border-b border-r border-black px-3 py-3 text-center font-normal dark:border-white">Date</th>
        </tr>
        {mouseData.map((mouseClick, mouseClickIdx) => (
          <tr
            key={`mouse-click-${mouseClickIdx}`}
            className={classNames(
              'text-xs md:text-sm',
              mouseClickIdx % 2 === 0 ? 'bg-lightest dark:bg-darkest' : 'bg-light dark:bg-dark'
            )}
          >
            <td className="border-b border-r border-black px-3 py-2 text-center dark:border-white">{mouseClick.x}</td>
            <td className="border-b border-r border-black px-3 py-2 text-center dark:border-white">{mouseClick.y}</td>
            <td className="border-b border-r border-black px-3 py-2 text-center dark:border-white">
              {mouseClick.date.toString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
