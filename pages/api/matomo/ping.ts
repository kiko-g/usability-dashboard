import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { config } from '@/utils/matomo'

type ResponseType = { matomoVersion: string } | { error: string; message?: string }

export default async function pingMatomoApi(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiUrl = `${config.matomoSiteUrl}/index.php?module=API&method=API.getMatomoVersion&format=json&token_auth=${config.matomoToken}`

  try {
    const response = await axios.get(apiUrl)
    return res.status(200).json({ matomoVersion: response.data.value })
  } catch (error: any) {
    if ('response' in error) {
      return res
        .status(error.response.status)
        .json({ error: 'Error from Matomo API', message: error.response.data.message })
    } else {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
