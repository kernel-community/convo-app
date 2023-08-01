// store data from data.ts to the database
import type { NextApiRequest, NextApiResponse } from "next";
import { migrate } from "src/server/utils/migrate/migrate";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let created;
  try {
    created = await migrate();
  } catch (err) {
    throw err;
  }
  res.status(200).json({
    data: created,
  });
}
