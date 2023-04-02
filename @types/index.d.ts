// Mouse Clicks
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

// Page Views
export type PageViewsSQL = {
  id: number
  duration: number
  visitedPages: string
  startTime: string
  totalEvents: number
  totalActions: number
  totalInteractions: number
  operatingSystem: string
  deviceScreenSize: string
  browserName: string
  deviceBrand: string
  deviceType: string
}

export type PageViewsAPI = {
  id: number
  duration: number
  pages: string[]
  startTime: Date
  totalEvents: number
  totalActions: number
  totalInteractions: number
  operatingSystem: string
  deviceScreenSize: {
    width: number
    height: number
  }
  browserName: string
  deviceBrand: string
  deviceType: string
}

// Mouse Clicks Viz Types
export type MouseClickVizType = 'table' | 'chart' | 'heatmap'
export type MouseClickVizTypeFilter = {
  name: string
  value: MouseClickVizType
}

// Page Visits Viz Types
export type PageVisitsVizType = 'table' | 'pages' | 'browsers'
export type PageVisitsVizTypeFilter = {
  name: string
  value: PageVisitsVizType
}
