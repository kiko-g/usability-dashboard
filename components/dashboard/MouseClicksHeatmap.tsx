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

export default function MouseClicksHeatmap({ mouseData }: Props) {
  const x = mouseData.map((click) => click.x)
  const y = mouseData.map((click) => click.y)

  const plotData = [
    {
      x: x,
      y: y,
      type: 'histogram2d' as const,
      colorscale: [
        [0, '#ffffff'] as [number, string],
        [0.5, 'rgba(128, 204, 224, 1)'] as [number, string],
        [1, '#1a84b8'] as [number, string],
      ],
    },
  ]

  const layout = {
    title: 'Mouse Clicks Heatmap',
    autosize: true,
    margin: {
      t: 50,
      b: 50,
      l: 50,
      r: 50,
    },
  }

  return <Plot data={plotData} layout={layout} className="h-full w-full" />
}
