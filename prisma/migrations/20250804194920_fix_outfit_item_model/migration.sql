/*
  Warnings:

  - You are about to drop the `OutfitItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OutfitItem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "outfit_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outfitId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "rotation" REAL NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "outfit_items_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "outfit_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WardrobeItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "outfit_items_outfitId_idx" ON "outfit_items"("outfitId");

-- CreateIndex
CREATE INDEX "outfit_items_itemId_idx" ON "outfit_items"("itemId");
