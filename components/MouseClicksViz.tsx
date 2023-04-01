import React from 'react'
import { MouseClicksAPI } from '../@types'
import { Loading, NotFound } from './utils'
import {
  MouseClicksChart,
  MouseClickStats,
  MouseClicksHeatmap,
  MouseClicksTable,
  SelectMouseClicksType,
} from './dashboard'

type VizType = 'table' | 'chart' | 'heatmap'
type VizTypeFilter = {
  name: string
  value: VizType
}

type Props = {}

export default function MouseClicksViz({}: Props) {
  const [error, setError] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [mouseData, setMouseData] = React.useState<MouseClicksAPI[]>([])
  const [vizType, setVizType] = React.useState<VizTypeFilter>({ name: 'Table', value: 'table' })

  const stats = React.useMemo(() => {
    const avgX = mouseData.reduce((acc, curr) => acc + curr.x, 0) / mouseData.length
    const avgY = mouseData.reduce((acc, curr) => acc + curr.y, 0) / mouseData.length

    return {
      'Average X': avgX.toFixed(2),
      'Average Y': avgY.toFixed(2),
      'Total Clicks': mouseData.length,
    }
  }, [mouseData])

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
    <section className="mt-2 flex flex-col space-y-4">
      <div className="flex flex-col items-end justify-between gap-2 md:flex-row">
        <MouseClickStats stats={stats} />
        <SelectMouseClicksType pickedHook={[vizType, setVizType]} />
      </div>

      {vizType.value === 'table' ? <MouseClicksTable mouseData={mouseData} /> : null}
      {vizType.value === 'chart' ? <MouseClicksChart mouseData={mouseData} /> : null}
      {vizType.value === 'heatmap' ? <MouseClicksHeatmap mouseData={mouseData} /> : null}
    </section>
  )
}
