-- CreateTable
CREATE TABLE "Connections" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "connectedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connections_connectedUserId_userId_key" ON "Connections"("connectedUserId", "userId");

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_connectedUserId_fkey" FOREIGN KEY ("connectedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
