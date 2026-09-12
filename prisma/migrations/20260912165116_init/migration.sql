-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRODUCER', 'ARTIST', 'BOTH');

-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('ACTIVE', 'SOLD_EXCLUSIVE', 'TAKEN_DOWN');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('ONE_TIME', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "FingerprintStatus" AS ENUM ('PENDING', 'CLEAR', 'FLAGGED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BOTH',
    "bio" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeAccountId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "key" TEXT,
    "audioFileUrl" TEXT NOT NULL,
    "coverArtUrl" TEXT,
    "status" "TrackStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprintStatus" "FingerprintStatus",

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseOption" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LicenseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL,
    "priceAtSale" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripePaymentIntentId" TEXT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Track_status_createdAt_idx" ON "Track"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseOption_trackId_type_key" ON "LicenseOption"("trackId", "type");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseOption" ADD CONSTRAINT "LicenseOption_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
