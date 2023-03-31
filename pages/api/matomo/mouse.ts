import { NextApiRequest, NextApiResponse } from 'next'
import type { MouseClicksAPI, MouseClicksSQL } from '../../../@types'
import { estabilishMySQLConnection, clicksQuery } from '../../../utils/sql'

const getMouseClicks = (req: NextApiRequest, res: NextApiResponse) => {
  const connection = estabilishMySQLConnection()
  const query = clicksQuery

  if (req.method === 'GET') {
    connection.query(query, (error, results) => {
      if (error) {
        res.status(500).json({ error: 'An error occurred while querying the database', details: error })
      } else {
        const sqlResults = results as MouseClicksSQL[]
        const apiResults: MouseClicksAPI[] = sqlResults.map((result) => ({
          x: parseInt(result.x),
          y: parseInt(result.y),
          date: new Date(result.dateString),
        }))
        res.status(200).json(apiResults)
      }
    })
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default getMouseClicks
