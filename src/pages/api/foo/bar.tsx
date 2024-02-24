import type { NextApiRequest, NextApiResponse } from "next";

export default async function bar(req: NextApiRequest, res: NextApiResponse) {
  console.log("inside foo/bar");
  return res.status(200).json({ ok: true });
}
