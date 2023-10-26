import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

export default async function getUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = _.pick(req.body, ["userId"]);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  res.status(200).json({
    data: user,
  });
}
