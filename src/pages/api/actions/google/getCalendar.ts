// test api
import type { NextApiRequest, NextApiResponse } from "next";
import { getCalendar } from "src/server/utils/google/getCalendar";
export default async function ping(req: NextApiRequest, res: NextApiResponse) {
  const cal = await getCalendar();
  res.status(200).json({
    data: JSON.stringify(cal),
  });
}
