import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

export default async function getUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = _.pick(req.body, ["address"]);
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      address,
    },
  });
  res.status(200).json({
    data: user,
  });
}
