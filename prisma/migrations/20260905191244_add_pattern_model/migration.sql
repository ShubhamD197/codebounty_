-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "primaryPatternId" TEXT;

-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pattern_name_key" ON "Pattern"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pattern_slug_key" ON "Pattern"("slug");

-- CreateIndex
CREATE INDEX "Pattern_order_idx" ON "Pattern"("order");

-- CreateIndex
CREATE INDEX "Problem_primaryPatternId_idx" ON "Problem"("primaryPatternId");

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_primaryPatternId_fkey" FOREIGN KEY ("primaryPatternId") REFERENCES "Pattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;
