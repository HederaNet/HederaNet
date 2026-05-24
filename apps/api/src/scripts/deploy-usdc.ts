#!/usr/bin/env tsx
/**
 * Deploy our testnet USDC token on Hedera.
 * Run once: pnpm tsx src/scripts/deploy-usdc.ts
 * Then add the printed token ID to .env as USDC_TOKEN_ID=
 * On mainnet, replace USDC_TOKEN_ID with Circle's official USDC token ID.
 */
import 'dotenv/config.js';
import { initHederaClient, createFungibleToken, mintFungibleTokens } from '@hederanet/hedera-sdk';

async function main() {
  const operatorId = process.env['HEDERA_OPERATOR_ID'];
  const operatorKey = process.env['HEDERA_OPERATOR_PRIVATE_KEY'];
  const network = (process.env['HEDERA_NETWORK'] ?? 'testnet') as 'testnet' | 'mainnet' | 'previewnet';

  if (!operatorId || !operatorKey) {
    console.error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_PRIVATE_KEY must be set in .env');
    process.exit(1);
  }

  const client = initHederaClient({ network, operatorId, operatorPrivateKey: operatorKey });
  if (!client) {
    console.error('Failed to init Hedera client — check your credentials');
    process.exit(1);
  }

  console.log('🚀 Deploying testnet USDC token...');

  const tokenId = await createFungibleToken({
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    supplyType: 'INFINITE',
    memo: 'HederaNet testnet USDC — swap for real Circle USDC on mainnet',
  });

  console.log(`✅ Token created: ${tokenId}`);

  // Mint initial treasury reserve: 10,000,000 USDC (10M × 10^6 base units)
  const INITIAL_SUPPLY = 10_000_000 * 1_000_000;
  console.log('💰 Minting 10,000,000 USDC to treasury...');
  await mintFungibleTokens(tokenId, INITIAL_SUPPLY);
  console.log('✅ Treasury funded with 10,000,000 USDC');

  console.log('\n─────────────────────────────────────────────');
  console.log(`USDC_TOKEN_ID=${tokenId}`);
  console.log('─────────────────────────────────────────────');
  console.log(`\nView on HashScan: https://hashscan.io/testnet/token/${tokenId}`);
  console.log('\nAdd the line above to apps/api/.env, then restart the server.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
