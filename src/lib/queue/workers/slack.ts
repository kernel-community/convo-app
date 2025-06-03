import { slackQueue, type SlackJobData } from "../slack";
import { sendMessage } from "src/utils/slack/sendMessage";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

// Process a slack notification job
async function processSlackJob(job: { data: SlackJobData }): Promise<void> {
  const { eventId, host, type } = job.data;

  console.log(
    `Processing Slack notification job for event ${eventId} with type ${type}`
  );

  try {
    // Get the community for community-specific profiles
    const community = await getCommunityFromSubdomain();

    // Fetch the event with all needed relationships
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        proposers: {
          include: {
            user: {
              include: {
                profiles: {
                  where: { communityId: community.id },
                  take: 1,
                },
              },
            },
          },
        },
        rsvps: {
          include: {
            attendee: {
              include: {
                profiles: {
                  where: { communityId: community.id },
                  take: 1,
                },
              },
            },
          },
        },
        collections: true,
        community: {
          include: {
            slack: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Send the Slack notification
    await sendMessage({
      event,
      host,
      type,
    });

    console.log(`Successfully sent Slack notification for event ${eventId}`);
  } catch (error) {
    console.error(
      `Error sending Slack notification for event ${eventId}:`,
      error
    );
    throw error; // Rethrow to allow Bull to handle retries
  }
}

// Start the slack queue worker
export function startSlackWorker() {
  // Set up concurrency - process up to 3 jobs at a time
  slackQueue.process(3, processSlackJob);

  console.log("🚀 Slack notification queue worker started");

  // Add event handlers for monitoring
  slackQueue.on("completed", (job) => {
    console.log(
      `✅ Slack notification job completed for event ${job.data.eventId}`
    );
  });

  slackQueue.on("failed", (job, error) => {
    console.error(
      `❌ Slack notification job failed for event ${job?.data?.eventId}:`,
      error
    );
  });

  return slackQueue;
}
