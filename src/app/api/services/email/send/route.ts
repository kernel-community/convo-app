import { EmailTemplate } from "src/components/Email/Test";
import { Resend } from "resend";
import { DateTime } from "luxon";
import { generateICalRequest } from "src/utils/generateICalString";
import { RRule } from "rrule";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  // fetch event id from request body
  // fetch recipient name and email from request body
  const startTime = DateTime.local(2024, 7, 10, 8, 30);
  const endTime = startTime.plus({ hour: 1 });
  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday: [RRule.MO, RRule.FR],
    until: startTime.plus({ weeks: 5 }).toJSDate(),
  });
  const recipient = `angela.gilhotra@gmail.com`;
  const recipientName = `Angela`;
  const iCal = generateICalRequest({
    start: startTime,
    end: endTime,
    organizer: {
      name: "Hedwig 🦉",
      email: "convo@kernel.community",
    },
    uid: "newnewanotherconvo",
    title: "yet another Test event",
    description: "henlo",
    location: "TBD",
    sequence: 0,
    recipient: {
      email: recipient,
    },
    rrule: rule.toString(),
  });
  try {
    const { data, error } = await resend.emails.send({
      from: "🦉 Hedwig from Convo Cafe<hedwig@convo.cafe>",
      to: [recipient],
      subject: "You're invited 👀🕺",
      react: EmailTemplate({ firstName: recipientName }),
      text: "hihi",
      attachments: [
        {
          filename: "convo.ics",
          content_type: "text/calendar;charset=utf-8;method=REQUEST",
          content: iCal.toString(),
        },
      ],
    });

    if (error) {
      console.log("there was an error");
      return Response.json({ error }, { status: 500 });
    }
    console.log(data);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
