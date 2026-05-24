-- Add new TransactionType enum values
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'SWAP';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'FAUCET';

-- Create SwapStatus enum
DO $$ BEGIN
  CREATE TYPE "SwapStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- MarketToken: registry of tradeable tokens with prices
CREATE TABLE IF NOT EXISTS "MarketToken" (
  "id"         TEXT NOT NULL,
  "symbol"     TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "tokenId"    TEXT,
  "decimals"   INTEGER NOT NULL,
  "priceUsdc"  DOUBLE PRECISION NOT NULL,
  "logoEmoji"  TEXT NOT NULL DEFAULT '🪙',
  "isActive"   BOOLEAN NOT NULL DEFAULT true,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MarketToken_symbol_key" ON "MarketToken"("symbol");
CREATE INDEX IF NOT EXISTS "MarketToken_symbol_idx" ON "MarketToken"("symbol");

-- SwapTransaction: records every executed swap
CREATE TABLE IF NOT EXISTS "SwapTransaction" (
  "id"            TEXT NOT NULL,
  "userAccountId" TEXT NOT NULL,
  "fromSymbol"    TEXT NOT NULL,
  "toSymbol"      TEXT NOT NULL,
  "fromAmount"    DOUBLE PRECISION NOT NULL,
  "toAmount"      DOUBLE PRECISION NOT NULL,
  "priceAtSwap"   DOUBLE PRECISION NOT NULL,
  "status"        "SwapStatus" NOT NULL DEFAULT 'PENDING',
  "hederaTxId"    TEXT,
  "errorMsg"      TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SwapTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SwapTransaction_userAccountId_idx" ON "SwapTransaction"("userAccountId");
CREATE INDEX IF NOT EXISTS "SwapTransaction_status_idx" ON "SwapTransaction"("status");
CREATE INDEX IF NOT EXISTS "SwapTransaction_createdAt_idx" ON "SwapTransaction"("createdAt");

-- FaucetClaim: rate-limiting faucet claims per account
CREATE TABLE IF NOT EXISTS "FaucetClaim" (
  "id"          TEXT NOT NULL,
  "accountId"   TEXT NOT NULL,
  "amountUsdc"  DOUBLE PRECISION NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FaucetClaim_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FaucetClaim_accountId_idx" ON "FaucetClaim"("accountId");
CREATE INDEX IF NOT EXISTS "FaucetClaim_createdAt_idx" ON "FaucetClaim"("createdAt");
