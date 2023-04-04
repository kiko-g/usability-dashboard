import React from 'react'
import type { PageViewsAPI, PageVisitsVizTypeFilter, PieData } from '../../@types'
import { PieChart } from '../viz'
import { Loading, NotFound } from '../utils'
import { PageVisitsTable, SelectPageVisitsType } from '../dashboard/visits'

type Props = {}

export default function PageVisitsViz({}: Props) {
  const [error, setError] = React.useState<boolean>(false)
  const [data, setData] = React.useState<PageViewsAPI[]>([])
  const [vizType, setVizType] = React.useState<PageVisitsVizTypeFilter>({ name: 'Table', value: 'table' })
  const loading = React.useMemo<boolean>(() => data.length === 0, [data])

  // create pages frequencies pie data array
  const visitedPagesFreqs = React.useMemo<PieData[]>(() => {
    const pagesFreq = data.map((item) => item.visitedUrls).flat()
    const pagesCount = pagesFreq.reduce<Record<string, number>>((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {})

    return Object.entries(pagesCount).map(([name, count]) => ({ name, count }))
  }, [data])

  // create browsers frequencies pie data array
  const browserFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const browser = curr.browserName
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {})

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }))
  }, [data])

  // create device type frequencies pie data array
  const deviceFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const device = curr.deviceType
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }))
  }, [data])

  // create screen width*height frequencies pie data array
  const screenFreqs = React.useMemo<PieData[]>(() => {
    const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
      const screen = curr.deviceScreenSize
      const screenStr = `${screen.width}x${screen.height}`
      acc[screenStr] = (acc[screenStr] || 0) + 1
      return acc
    }, {})

    return Object.entries(frequencies).map(([name, count]) => ({ name, count }))
  }, [data])

  React.useEffect(() => {
    fetch('/api/matomo/visits')
      .then((res) => res.json())
      .then((data: PageViewsAPI[]) => {
        setData(data)
      })
      .catch((err) => {
        setError(true)
        console.error(err)
      })
  }, [])

  if (loading) return <Loading />
  if (error) return <NotFound />

  return (
    <section className="mt-2 flex flex-col space-y-4">
      <div className="flex flex-col items-end justify-end gap-2 md:flex-row">
        <SelectPageVisitsType pickedHook={[vizType, setVizType]} />
      </div>

      {vizType.value === 'table' && <PageVisitsTable visitsData={data} />}
      {vizType.value === 'urls' && <PieChart data={visitedPagesFreqs} title="Visited URLs Pie Chart" />}
      {vizType.value === 'browsers' && <PieChart data={browserFreqs} title="Browser Usage Pie Chart" />}
      {vizType.value === 'devices' && <PieChart data={deviceFreqs} title="Devices Type Pie Chart" />}
      {vizType.value === 'screens' && <PieChart data={screenFreqs} title="Devices Type Pie Chart" />}
    </section>
  )
}
