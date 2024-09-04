-- CreateTable
CREATE TABLE "Nominee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "Nominee_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
