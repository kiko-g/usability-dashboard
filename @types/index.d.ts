export type MouseClicksSQL = {
  x: string
  y: string
  dateString: string
}

export type MouseClicksAPI = {
  x: number
  y: number
  date: Date
}

export type VizType = 'table' | 'chart' | 'heatmap'
export type VizTypeFilter = {
  name: string
  value: VizType
}
