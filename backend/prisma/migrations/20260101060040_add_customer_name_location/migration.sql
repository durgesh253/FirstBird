-- CreateTable
CREATE TABLE "CSVUpload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopId" INTEGER,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "CSVUpload_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uploadId" INTEGER NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "location" TEXT,
    "totalOrders" INTEGER NOT NULL,
    "customerType" TEXT NOT NULL,
    "productsBought" TEXT NOT NULL,
    "orderIds" TEXT NOT NULL,
    "locations" TEXT,
    "firstOrderDate" DATETIME NOT NULL,
    "lastOrderDate" DATETIME NOT NULL,
    "totalSpent" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerAnalysis_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "CSVUpload" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CSVOrderRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uploadId" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "productName" TEXT NOT NULL,
    "location" TEXT,
    "orderDate" DATETIME NOT NULL,
    "orderAmount" DECIMAL NOT NULL,
    "rawData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CSVOrderRecord_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "CSVUpload" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustomerAnalysis_uploadId_idx" ON "CustomerAnalysis"("uploadId");

-- CreateIndex
CREATE INDEX "CustomerAnalysis_customerPhone_idx" ON "CustomerAnalysis"("customerPhone");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAnalysis_uploadId_customerPhone_key" ON "CustomerAnalysis"("uploadId", "customerPhone");

-- CreateIndex
CREATE INDEX "CSVOrderRecord_uploadId_idx" ON "CSVOrderRecord"("uploadId");

-- CreateIndex
CREATE INDEX "CSVOrderRecord_customerPhone_idx" ON "CSVOrderRecord"("customerPhone");
