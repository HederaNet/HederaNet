-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUBSCRIBER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OperatorTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISPUTED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION', 'ENERGY_TRADE', 'STAKE', 'UNSTAKE', 'REWARD', 'WITHDRAWAL', 'GOVERNANCE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "VoteChoice" AS ENUM ('YES', 'NO', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "IoTReadingType" AS ENUM ('ENERGY_DELIVERY', 'NETWORK_UPTIME', 'COMPUTE_JOB', 'SOLAR_GENERATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "hederaAccountId" TEXT NOT NULL,
    "hederaPublicKey" TEXT,
    "hederaPrivateKey" TEXT,
    "email" TEXT,
    "name" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'SUBSCRIBER',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hederaAccountId" TEXT NOT NULL,
    "tier" "OperatorTier" NOT NULL DEFAULT 'BRONZE',
    "stakedHbar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotspot" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "hcsTopicId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "coverageRadiusMeters" INTEGER NOT NULL,
    "monthlyPriceHbar" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uptimePct30d" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarInstallation" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "capacityKw" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "hcsTopicId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolarInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyListing" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "pricePerKwhHbar" DOUBLE PRECISION NOT NULL,
    "availableUnits" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyTrade" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerAccountId" TEXT NOT NULL,
    "sellerAccountId" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "totalHbar" DOUBLE PRECISION NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "contractTradeId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "subscriberAccountId" TEXT NOT NULL,
    "hotspotId" TEXT NOT NULL,
    "nftTokenId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "fromAccount" TEXT NOT NULL,
    "toAccount" TEXT,
    "amountHbar" DOUBLE PRECISION NOT NULL,
    "contractId" TEXT,
    "txHashHedera" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "proposerAccountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "votingEndsAt" TIMESTAMP(3) NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "yesVotes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "noVotes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "abstainVotes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contractProposalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voterAccountId" TEXT NOT NULL,
    "choice" "VoteChoice" NOT NULL,
    "votingPower" DOUBLE PRECISION NOT NULL,
    "txHashHedera" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IoTReading" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "readingType" "IoTReadingType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "tradeId" TEXT,
    "confirmedOnChain" BOOLEAN NOT NULL DEFAULT false,
    "hcsMessageId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IoTReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkStats" (
    "id" TEXT NOT NULL,
    "totalActiveHotspots" INTEGER NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "totalOperators" INTEGER NOT NULL,
    "energyTradedKwhToday" DOUBLE PRECISION NOT NULL,
    "totalHbarSettled" DOUBLE PRECISION NOT NULL,
    "totalSubscriptions" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_hederaAccountId_key" ON "User"("hederaAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_hederaAccountId_idx" ON "User"("hederaAccountId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_userId_key" ON "Operator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_hederaAccountId_key" ON "Operator"("hederaAccountId");

-- CreateIndex
CREATE INDEX "Operator_lat_lng_idx" ON "Operator"("lat", "lng");

-- CreateIndex
CREATE INDEX "Operator_tier_idx" ON "Operator"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Hotspot_hcsTopicId_key" ON "Hotspot"("hcsTopicId");

-- CreateIndex
CREATE INDEX "Hotspot_lat_lng_idx" ON "Hotspot"("lat", "lng");

-- CreateIndex
CREATE INDEX "Hotspot_isActive_idx" ON "Hotspot"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SolarInstallation_hcsTopicId_key" ON "SolarInstallation"("hcsTopicId");

-- CreateIndex
CREATE INDEX "SolarInstallation_lat_lng_idx" ON "SolarInstallation"("lat", "lng");

-- CreateIndex
CREATE INDEX "EnergyListing_isActive_idx" ON "EnergyListing"("isActive");

-- CreateIndex
CREATE INDEX "EnergyTrade_buyerAccountId_idx" ON "EnergyTrade"("buyerAccountId");

-- CreateIndex
CREATE INDEX "EnergyTrade_sellerAccountId_idx" ON "EnergyTrade"("sellerAccountId");

-- CreateIndex
CREATE INDEX "EnergyTrade_status_idx" ON "EnergyTrade"("status");

-- CreateIndex
CREATE INDEX "Subscription_subscriberAccountId_idx" ON "Subscription"("subscriberAccountId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHashHedera_key" ON "Transaction"("txHashHedera");

-- CreateIndex
CREATE INDEX "Transaction_fromAccount_idx" ON "Transaction"("fromAccount");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_proposalId_voterAccountId_key" ON "Vote"("proposalId", "voterAccountId");

-- CreateIndex
CREATE INDEX "IoTReading_deviceId_idx" ON "IoTReading"("deviceId");

-- CreateIndex
CREATE INDEX "IoTReading_readingType_idx" ON "IoTReading"("readingType");

-- CreateIndex
CREATE INDEX "NetworkStats_recordedAt_idx" ON "NetworkStats"("recordedAt");

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolarInstallation" ADD CONSTRAINT "SolarInstallation_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyListing" ADD CONSTRAINT "EnergyListing_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "SolarInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyTrade" ADD CONSTRAINT "EnergyTrade_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "EnergyListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_hotspotId_fkey" FOREIGN KEY ("hotspotId") REFERENCES "Hotspot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriberAccountId_fkey" FOREIGN KEY ("subscriberAccountId") REFERENCES "User"("hederaAccountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IoTReading" ADD CONSTRAINT "IoTReading_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "EnergyTrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
