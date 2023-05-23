import type { User } from "@prisma/client";
import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

export default async function user(req: NextApiRequest, res: NextApiResponse) {
  const { user }: { user: Partial<User> } = _.pick(req.body, ["user"]);
  const fetched = await prisma.user.findUniqueOrThrow({
    where: {
      address: user.address,
    },
  });

  // update
  const updated = await prisma.user.update({
    where: { address: fetched.address },
    data: { ...user },
  });

  console.log(`
    Updated user ${JSON.stringify(updated)} for address: ${fetched.address}
  `);

  res.status(200).json({ data: updated });
}
