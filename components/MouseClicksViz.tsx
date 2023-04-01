import React from 'react'
import { MouseClicksAPI } from '../@types'
import { Loading, NotFound } from './utils'
import { MouseClicksChart, MouseClicksHeatmap, MouseClicksTable, SelectMouseClicksType } from './dashboard'

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
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-end">
        <SelectMouseClicksType pickedHook={[vizType, setVizType]} />
      </div>
      {vizType.value === 'table' ? <MouseClicksTable mouseData={mouseData} /> : null}
      {vizType.value === 'chart' ? <MouseClicksChart mouseData={mouseData} /> : null}
      {vizType.value === 'heatmap' ? <MouseClicksHeatmap mouseData={mouseData} /> : null}
    </div>
  )
}
