import type { NextApiRequest, NextApiResponse } from 'next';
import pingMatomoApi from './ping';

type ResponseType = { matomoVersion: string } | { error: string; message?: string };

export default async function pingMatomoApiDuplicate(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  pingMatomoApi(req, res);
}
