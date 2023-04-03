import React from 'react'
import { ArrowDownCircleIcon, MinusCircleIcon, PlusCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

type Props = {
  data: any[]
  initialRows: number
  rowsHook: [number, React.Dispatch<React.SetStateAction<number>>]
}

export default function TableInteractButtons({ data, initialRows, rowsHook }: Props) {
  const [rowCount, setRowCount] = rowsHook
  const noLess = React.useMemo(() => rowCount - initialRows <= 0, [rowCount, initialRows])
  const noMore = React.useMemo(() => rowCount >= data.length, [rowCount, data])

  return (
    <div className="mt-3 flex flex-col justify-center gap-3 md:flex-row">
      {/* Show less rows */}
      <button
        disabled={noLess}
        onClick={() => setRowCount((prev) => prev - initialRows)}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-primary bg-primary/50 px-4 py-2 text-sm font-normal text-white shadow-md transition hover:enabled:bg-primary hover:enabled:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-25 dark:border-secondary dark:bg-secondary/50 dark:hover:enabled:bg-secondary"
      >
        <span>Show {initialRows} less</span>
        <MinusCircleIcon className="h-5 w-5" />
      </button>

      {/* Show more rows */}
      <button
        disabled={noMore}
        onClick={() => setRowCount((prev) => prev + initialRows)}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-primary bg-primary/50 px-4 py-2 text-sm font-normal text-white shadow-md transition hover:enabled:bg-primary hover:enabled:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-25 dark:border-secondary dark:bg-secondary/50 dark:hover:enabled:bg-secondary"
      >
        <span>Show {initialRows} more</span>
        <PlusCircleIcon className="h-5 w-5" />
      </button>

      {/* Show all rows */}
      <button
        disabled={noMore}
        onClick={() => setRowCount(data.length)}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-primary bg-primary/50 px-4 py-2 text-sm font-normal text-white shadow-md transition hover:enabled:bg-primary hover:enabled:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-25 dark:border-secondary dark:bg-secondary/50 dark:hover:enabled:bg-secondary"
      >
        <span>Show all {data.length} rows</span>
        <ArrowDownCircleIcon className="h-5 w-5" />
      </button>

      {/* Show all rows */}
      <button
        disabled={noLess}
        onClick={() => setRowCount(initialRows)}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-primary bg-primary/50 px-4 py-2 text-sm font-normal text-white shadow-md transition hover:enabled:bg-primary hover:enabled:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-25 dark:border-secondary dark:bg-secondary/50 dark:hover:enabled:bg-secondary"
      >
        <span>Reset rows</span>
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
