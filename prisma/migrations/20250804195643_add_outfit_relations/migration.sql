-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutfitItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WardrobeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OutfitItem" ("height", "id", "itemId", "outfitId", "rotation", "width", "x", "y", "zIndex") SELECT "height", "id", "itemId", "outfitId", "rotation", "width", "x", "y", "zIndex" FROM "OutfitItem";
DROP TABLE "OutfitItem";
ALTER TABLE "new_OutfitItem" RENAME TO "OutfitItem";
CREATE INDEX "OutfitItem_outfitId_idx" ON "OutfitItem"("outfitId");
CREATE INDEX "OutfitItem_itemId_idx" ON "OutfitItem"("itemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
