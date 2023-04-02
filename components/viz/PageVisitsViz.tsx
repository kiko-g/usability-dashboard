import React from 'react'
import type { PageViewsAPI } from '../../@types'
import { Loading, NotFound } from '../utils'
import { PageVisitsTable } from '../dashboard/visits'

type Props = {}

export default function PageVisitsViz({}: Props) {
  const [error, setError] = React.useState<boolean>(false)
  const [data, setData] = React.useState<PageViewsAPI[]>([])

  const loading = React.useMemo<boolean>(() => data.length === 0, [data])

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
      <PageVisitsTable visitsData={data} />
    </section>
  )
}
