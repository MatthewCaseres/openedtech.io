-- CreateTable
CREATE TABLE "Problem" (
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "color" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("userId","id")
);

-- AddForeignKey
ALTER TABLE "Problem" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
