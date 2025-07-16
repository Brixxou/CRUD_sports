-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sport" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duree" INTEGER NOT NULL,
    "description" TEXT
);
