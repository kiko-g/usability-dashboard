// components/PieChart.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import type { PieData } from '../../@types';
import { Loading } from '.';

const Plot = dynamic(() => import('react-plotly.js').then((mod) => mod.default), {
  ssr: false,
  loading: Loading,
});

interface PieChartProps {
  data: PieData[];
  title?: string;
}

export default function PieChart({ data, title }: PieChartProps) {
  if (data.length === 0) return null;

  const labels = data.map((item) => item.name);
  const values = data.map((item) => item.count);

  const plotData = [
    {
      labels: labels,
      values: values,
      type: 'pie' as const,
    },
  ];

  const layout = {
    title: title ? title : 'Pie Chart',
    autosize: true,
    margin: {
      t: 50,
      b: 50,
      l: 50,
      r: 50,
    },
  };

  return <Plot data={plotData} layout={layout} />;
}
