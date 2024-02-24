-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "googleServiceId" TEXT,
ADD COLUMN     "slackServiceId" TEXT;

-- AlterTable
ALTER TABLE "Google" ADD COLUMN     "calendarId" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_slackServiceId_fkey" FOREIGN KEY ("slackServiceId") REFERENCES "Slack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_googleServiceId_fkey" FOREIGN KEY ("googleServiceId") REFERENCES "Google"("id") ON DELETE SET NULL ON UPDATE CASCADE;
