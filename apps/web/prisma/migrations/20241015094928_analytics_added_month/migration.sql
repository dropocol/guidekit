-- CreateTable
CREATE TABLE "UserMonthlyAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMonthlyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMonthlyAnalytics_userId_idx" ON "UserMonthlyAnalytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMonthlyAnalytics_userId_year_month_key" ON "UserMonthlyAnalytics"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "UserMonthlyAnalytics" ADD CONSTRAINT "UserMonthlyAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
