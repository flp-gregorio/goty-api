-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nominee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "Nominee_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Nominee" ("categoryId", "description", "developer", "genre", "id", "name") SELECT "categoryId", "description", "developer", "genre", "id", "name" FROM "Nominee";
DROP TABLE "Nominee";
ALTER TABLE "new_Nominee" RENAME TO "Nominee";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
