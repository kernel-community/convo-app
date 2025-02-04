/*
  Warnings:

  - A unique constraint covering the columns `[eventId,slackId]` on the table `PostedSlackMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostedSlackMessage_eventId_slackId_key" ON "PostedSlackMessage"("eventId", "slackId");
