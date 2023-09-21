import { NextApiRequest, NextApiResponse } from 'next'
import type { MouseClicksAPI, MouseClicksSQL } from '@/@types'

import { estabilishMySQLConnection, clicksQuery as query } from '@/utils/sql'

export default function getMouseClicksSQL(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const connection = estabilishMySQLConnection()
  if (!connection) return res.status(403).json({ error: 'MySQL connection failed' })

  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'An error occurred while querying the database', details: error })
    } else {
      const sqlResults = results as MouseClicksSQL[]
      const apiResults: MouseClicksAPI[] = sqlResults.map((result) => ({
        x: parseInt(result.x),
        y: parseInt(result.y),
        date: new Date(result.dateString),
      }))
      return res.status(200).json(apiResults)
    }
  })
}
