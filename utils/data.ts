import { PieData } from '../@types'

export const createPieData = (data: any[], key: string): PieData[] => {
  const frequencies = data.reduce<Record<string, number>>((acc, curr) => {
    const name = curr[key]
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  return Object.entries(frequencies).map(([name, count]) => ({ name, count }))
}
