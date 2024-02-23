/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `Community` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "_CommunityToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CommunityToEvent_AB_unique" ON "_CommunityToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_CommunityToEvent_B_index" ON "_CommunityToEvent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Community_subdomain_key" ON "Community"("subdomain");

-- AddForeignKey
ALTER TABLE "_CommunityToEvent" ADD CONSTRAINT "_CommunityToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityToEvent" ADD CONSTRAINT "_CommunityToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
