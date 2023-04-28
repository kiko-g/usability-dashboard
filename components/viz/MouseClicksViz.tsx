import React from 'react'
import type { MouseClicksAPI, MouseClickVizTypeFilter } from '../../@types'
import { Loading, NotFound } from '../utils'
import {
  MouseClicksChart,
  MouseClickStats,
  MouseClicksHeatmap,
  MouseClicksTable,
  SelectMouseClicksType,
} from '../dashboard/mouse'

type Props = {}

export default function MouseClicksViz({}: Props) {
  const [error, setError] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [data, setData] = React.useState<MouseClicksAPI[]>([])
  const [vizType, setVizType] = React.useState<MouseClickVizTypeFilter>({ name: 'All', value: 'all' })

  const seeAll = React.useMemo<boolean>(() => vizType.value === 'all', [vizType])
  const stats = React.useMemo(() => {
    const avgX = data.reduce((acc, curr) => acc + curr.x, 0) / data.length
    const avgY = data.reduce((acc, curr) => acc + curr.y, 0) / data.length

    return {
      'Average X': avgX.toFixed(2),
      'Average Y': avgY.toFixed(2),
      'Total Clicks': data.length,
    }
  }, [data])

  React.useEffect(() => {
    fetch('/api/matomo/mouse')
      .then((res) => res.json())
      .then((data: MouseClicksAPI[]) => {
        setLoading(false)
        setData(data)
      })
      .catch((err) => {
        setError(true)
        console.error(err)
      })
  }, [])

  if (loading) return <Loading />
  if (error) return <NotFound />

  return data.length === 0 ? (
    <div className="mt-2 rounded border bg-black/20 p-4 dark:bg-white/20">No Mouse Data Found.</div>
  ) : (
    <section className="mt-2 flex flex-col space-y-4">
      <div className="flex flex-col items-end justify-between gap-2 md:flex-row">
        <MouseClickStats stats={stats} />
        <SelectMouseClicksType pickedHook={[vizType, setVizType]} />
      </div>

      <div className="flex flex-col space-y-8">
        {vizType.value === 'chart' || seeAll ? <MouseClicksChart mouseData={data} /> : null}
        {vizType.value === 'heatmap' || seeAll ? <MouseClicksHeatmap mouseData={data} /> : null}
        {vizType.value === 'table' || seeAll ? <MouseClicksTable mouseData={data} /> : null}
      </div>
    </section>
  )
}
