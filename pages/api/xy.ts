// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  x: number[];
  y: number[];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  return res.status(200).json({ x: [1, 2, 3, 4, 5], y: [2, 4, 6, 8, 10] });
}
