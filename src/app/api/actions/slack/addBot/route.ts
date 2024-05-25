import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

// export default async function addBot(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   console.log("[api] actions/slack/addBot");

//   const { botToken, channelId } = pick(req.body, ["botToken", "channelId"]);

//   if (!botToken || !channelId) {
//     throw new Error("one of botToken, userToken or channelId undefined");
//   }
//   const channel = channelId;
//   const addBotToken = await prisma.slack.upsert({
//     where: {
//       botToken_channel: {
//         botToken,
//         channel,
//       },
//     },
//     update: {
//       botToken,
//       channel,
//     },
//     create: {
//       botToken,
//       channel,
//     },
//   });

//   console.log(`slack Bot token upserted`, JSON.stringify(addBotToken));

//   return res.status(200).json({ data: addBotToken });
// }
