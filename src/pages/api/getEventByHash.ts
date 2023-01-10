import type {NextApiRequest, NextApiResponse} from "next";
import { prisma } from "src/server/db";

export default async function getEventByHash(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const hash = req.body["hash"];
  if (!hash) {
    throw new Error ("Hash undefined in req.body");
  }
  const event = await prisma.event.findMany({
    where: { hash }
  })
  res.status(200).json({ data: event });
}
