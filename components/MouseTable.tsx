import React from 'react'
import classNames from 'classnames'
import { MouseClicksAPI } from '../@types'
import { Loading, NotFound } from './utils'

type Props = {}

export default function MouseTable({}: Props) {
  const [error, setError] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [mouseData, setMouseData] = React.useState<MouseClicksAPI[]>([])

  React.useEffect(() => {
    fetch('/api/matomo/mouse')
      .then((res) => res.json())
      .then((data: MouseClicksAPI[]) => {
        setLoading(false)
        setMouseData(data)
      })
      .catch((err) => {
        setError(true)
        setLoading(false)
        console.error(err)
      })
  }, [])

  if (loading) return <Loading />
  if (error) return <NotFound />

  return (
    <table className="mt-2 border border-black bg-lightest dark:border-transparent">
      <tr className="w-min border-b border-black bg-blue-600 text-left text-white shadow dark:border-white dark:bg-orange-500">
        <th className="px-4 py-3">X</th>
        <th className="px-4 py-3">Y</th>
        <th className="px-4 py-3">Date</th>
      </tr>
      {mouseData.map((mouseClick, mouseClickIdx) => (
        <tr
          key={`mouse-click-${mouseClickIdx}`}
          className={classNames(
            mouseClickIdx % 2 === 0 ? 'bg-lightest dark:bg-darkest' : 'bg-light dark:bg-dark',
            'w-auto text-sm'
          )}
        >
          <td className="px-3 py-3">{mouseClick.x}</td>
          <td className="px-3 py-3">{mouseClick.y}</td>
          <td className="px-3 py-3">{mouseClick.date.toString()}</td>
        </tr>
      ))}
    </table>
  )
}
