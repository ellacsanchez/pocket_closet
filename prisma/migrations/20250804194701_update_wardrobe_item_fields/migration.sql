/*
  Warnings:

  - Added the required column `updatedAt` to the `WardrobeItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Outfit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Outfit" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "Outfit";
DROP TABLE "Outfit";
ALTER TABLE "new_Outfit" RENAME TO "Outfit";
CREATE INDEX "Outfit_userId_idx" ON "Outfit"("userId");
CREATE TABLE "new_OutfitItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outfitId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "rotation" REAL NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutfitItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WardrobeItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OutfitItem" ("height", "id", "itemId", "outfitId", "rotation", "width", "x", "y", "zIndex") SELECT "height", "id", "itemId", "outfitId", "rotation", "width", "x", "y", "zIndex" FROM "OutfitItem";
DROP TABLE "OutfitItem";
ALTER TABLE "new_OutfitItem" RENAME TO "OutfitItem";
CREATE INDEX "OutfitItem_outfitId_idx" ON "OutfitItem"("outfitId");
CREATE INDEX "OutfitItem_itemId_idx" ON "OutfitItem"("itemId");
CREATE TABLE "new_WardrobeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT,
    "brand" TEXT,
    "imageUrl" TEXT,
    "publicId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WardrobeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WardrobeItem" ("category", "createdAt", "id", "imageUrl", "publicId", "title", "userId") SELECT "category", "createdAt", "id", "imageUrl", "publicId", "title", "userId" FROM "WardrobeItem";
DROP TABLE "WardrobeItem";
ALTER TABLE "new_WardrobeItem" RENAME TO "WardrobeItem";
CREATE INDEX "WardrobeItem_userId_idx" ON "WardrobeItem"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
