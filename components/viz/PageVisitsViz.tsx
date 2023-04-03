import React from 'react'
import type { PageViewsAPI, PageVisitsVizTypeFilter, PieData } from '../../@types'
import { createPieData } from '../../utils/data'
import { PieChart } from '../viz'
import { Loading, NotFound } from '../utils'
import { PageVisitsTable, SelectPageVisitsType } from '../dashboard/visits'

type Props = {}

export default function PageVisitsViz({}: Props) {
  const [error, setError] = React.useState<boolean>(false)
  const [data, setData] = React.useState<PageViewsAPI[]>([])
  const [vizType, setVizType] = React.useState<PageVisitsVizTypeFilter>({ name: 'Table', value: 'table' })

  const loading = React.useMemo<boolean>(() => data.length === 0, [data])
  const browserData = React.useMemo<PieData[]>(() => createPieData(data, 'browserName'), [data])

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
      {vizType.value === 'browsers' && <PieChart data={browserData} title="Browser Usage Pie Chart" />}
    </section>
  )
}
