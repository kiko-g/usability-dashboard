import React from 'react';
import type { MouseClicksAPI, MouseClickVizTypeFilter } from '../../@types';
import { Loading, NotFound } from '../utils';
import {
  MouseClicksChart,
  MouseClickStats,
  MouseClicksHeatmap,
  MouseClicksTable,
  SelectMouseClicksType,
} from '../dashboard/mouse';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type Props = {};

export default function MouseClicksViz({}: Props) {
  const [data, setData] = React.useState<MouseClicksAPI[]>([]);
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [willFetch, setWillFetch] = React.useState<boolean>(true);

  const [vizType, setVizType] = React.useState<MouseClickVizTypeFilter>({ name: 'All', value: 'all' });

  const seeAll = React.useMemo<boolean>(() => vizType.value === 'all', [vizType]);
  const stats = React.useMemo(() => {
    const avgX = data.reduce((acc, curr) => acc + curr.x, 0) / data.length;
    const avgY = data.reduce((acc, curr) => acc + curr.y, 0) / data.length;

    return {
      'Average X': avgX.toFixed(2),
      'Average Y': avgY.toFixed(2),
      'Total Clicks': data.length,
    };
  }, [data]);

  React.useEffect(() => {
    if (!willFetch) return;

    fetch('/api/matomo/mouse')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MouseClicksAPI[]) => {
        if (data === null) {
          setData([]);
          setError(true);
          setLoading(false);
          setWillFetch(false);
        } else {
          setData(data);
          setError(false);
          setLoading(false);
          setWillFetch(false);
        }
      });
  }, [willFetch]);

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="space-y-3">
        <NotFound />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              setWillFetch(true);
            }}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-white transition hover:opacity-80"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span className="text-sm">Fetch again</span>
          </button>
        </div>
      </div>
    );

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
  );
}
