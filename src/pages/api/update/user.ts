import type { User } from "@prisma/client";
import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

export default async function user(req: NextApiRequest, res: NextApiResponse) {
  const { user }: { user: Partial<User> } = _.pick(req.body, ["user"]);
  const fetched = user.id
    ? await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      })
    : undefined;
  let updated;
  if (!fetched) {
    // create
    updated = await prisma.user.create({
      data: { ...user },
    });
  } else {
    // update
    updated = await prisma.user.update({
      where: { id: fetched.id },
      data: { ...user },
    });
  }

  console.log(`
    Updated user ${JSON.stringify(updated)} for id: ${updated.id}
  `);

  res.status(200).json({ data: updated });
}
