import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import type { RsvpIntention } from "src/context/RsvpIntentionContext";

// @todo
export default async function sendInvite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("send gcal invite here");
  const { rsvp }: { rsvp: RsvpIntention } = pick(req.body, ["rsvp"]);

  console.log({ rsvp });

  res.status(200).json({ data: rsvp });
}
