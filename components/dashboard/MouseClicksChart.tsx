import React from 'react'
import dynamic from 'next/dynamic'
import type { MouseClicksAPI } from '../../@types'
import { Loading } from '../utils'

const Plot = dynamic(() => import('react-plotly.js').then((mod) => mod.default), {
  ssr: false,
  loading: Loading,
})

interface Props {
  mouseData: MouseClicksAPI[]
}

export default function MouseClicksChart({ mouseData }: Props) {
  const xValues = mouseData.map((item) => item.x)
  const yValues = mouseData.map((item) => item.y)

  const plotData = [
    {
      x: xValues,
      y: yValues,
      mode: 'markers' as const,
      type: 'scatter' as const,
      marker: {
        color: '#10547f',
        size: 10,
      },
    },
  ]

  const layout = {
    title: 'Mouse Clicks',
    xaxis: {
      title: 'X',
    },
    yaxis: {
      title: 'Y',
    },
    margin: {
      t: 50,
      b: 50,
      l: 50,
      r: 50,
      pad: 0, // Padding between the plotting area and the axis lines
    },
  }

  return <Plot data={plotData} layout={layout} className="h-full w-full" />
}
