-- CreateTable
CREATE TABLE "PostedSlackMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "ts" TEXT NOT NULL,
    "slackId" TEXT NOT NULL,

    CONSTRAINT "PostedSlackMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostedSlackMessage" ADD CONSTRAINT "PostedSlackMessage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostedSlackMessage" ADD CONSTRAINT "PostedSlackMessage_slackId_fkey" FOREIGN KEY ("slackId") REFERENCES "Slack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
