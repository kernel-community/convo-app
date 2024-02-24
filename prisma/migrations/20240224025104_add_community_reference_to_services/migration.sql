-- AlterTable
ALTER TABLE "Google" ADD COLUMN     "communityId" TEXT;

-- AlterTable
ALTER TABLE "Slack" ADD COLUMN     "communityId" TEXT;

-- AddForeignKey
ALTER TABLE "Google" ADD CONSTRAINT "Google_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slack" ADD CONSTRAINT "Slack_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;
