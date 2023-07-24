-- CreateTable
CREATE TABLE "Slack" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botToken" TEXT NOT NULL,
    "channel" TEXT NOT NULL,

    CONSTRAINT "Slack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Slack_botToken_channel_key" ON "Slack"("botToken", "channel");
