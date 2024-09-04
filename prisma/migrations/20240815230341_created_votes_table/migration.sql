-- CreateTable
CREATE TABLE "Votes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "nomineeId" INTEGER NOT NULL,
    CONSTRAINT "Votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Votes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Votes_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "Nominee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
