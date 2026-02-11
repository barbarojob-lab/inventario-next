-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Store" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "storeId" INTEGER NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "qty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "payment" REAL NOT NULL,
    "daysWorked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Waste" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Waste_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" REAL NOT NULL,
    "costUnit" REAL NOT NULL DEFAULT 0,
    "profitTotal" REAL NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costUnit" REAL NOT NULL,
    "total" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShiftClosure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "storeId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShiftClosure_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShiftClosure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
