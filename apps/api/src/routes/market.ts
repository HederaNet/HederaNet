import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { getEnv } from '@hederanet/config';
import { decrypt } from '../lib/crypto.js';
import {
  ensureTokenAssociated,
  transferToken,
  transferTokenFromUser,
  transferHbarFromUser,
  transferHbar,
  mintFungibleTokens,
  atomicTokenForHbar,
  atomicHbarForToken,
  atomicTokenForToken,
  getHbarBalance,
  getAccountTokenBalances,
} from '@hederanet/hedera-sdk';

export const marketRouter: Router = Router();

const FAUCET_AMOUNT_USDC = 100;
const FAUCET_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// AMM fee: 0.3% (30 basis points), same as Uniswap v2
const AMM_FEE_BPS = 30;

// Constant-product AMM output: amountOut = (amountIn * (1-fee) * reserveOut) / (reserveIn + amountIn * (1-fee))
function ammGetAmountOut(amountIn: number, reserveIn: number, reserveOut: number, feeBps = AMM_FEE_BPS): number {
  if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) return 0;
  const amountInWithFee = amountIn * (10000 - feeBps); // scaled by 10000
  return (amountInWithFee * reserveOut) / (reserveIn * 10000 + amountInWithFee);
}

// ─── Seed / upsert market tokens from env ────────────────────────────────────

export async function seedMarketTokens(): Promise<void> {
  const env = getEnv();

  // Initial AMM pool reserves for pool tokens:
  // HNET: 1M tokens at $0.01 each → pair with 10,000 USDC
  // HEC:  500K tokens at $0.002 each → pair with 1,000 USDC
  // HCC:  10M tokens at $0.0001 each → pair with 1,000 USDC
  const tokens = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      tokenId: env.USDC_TOKEN_ID ?? null,
      decimals: 6,
      priceUsdc: 1.0,
      logoEmoji: '💵',
      poolReserveToken: 0,
      poolReserveUsdc: 0,
    },
    {
      symbol: 'HBAR',
      name: 'HBAR',
      tokenId: null,
      decimals: 8,
      priceUsdc: 0.07,
      logoEmoji: 'ℏ',
      poolReserveToken: 0,
      poolReserveUsdc: 0,
    },
    {
      symbol: 'HNET',
      name: 'HederaNet Token',
      tokenId: env.HNET_TOKEN_ID,
      decimals: 8,
      priceUsdc: 0.01,
      logoEmoji: '🌐',
      poolReserveToken: 1_000_000,
      poolReserveUsdc: 10_000,
    },
    {
      symbol: 'HEC',
      name: 'Hedera Energy Credits',
      tokenId: env.HEC_TOKEN_ID,
      decimals: 2,
      priceUsdc: 0.002,
      logoEmoji: '⚡',
      poolReserveToken: 500_000,
      poolReserveUsdc: 1_000,
    },
    {
      symbol: 'HCC',
      name: 'Hedera Compute Credits',
      tokenId: env.HCC_TOKEN_ID,
      decimals: 6,
      priceUsdc: 0.0001,
      logoEmoji: '💻',
      poolReserveToken: 10_000_000,
      poolReserveUsdc: 1_000,
    },
  ];

  for (const token of tokens) {
    const existing = await prisma.marketToken.findUnique({ where: { symbol: token.symbol } });

    if (existing) {
      // Update token metadata but don't overwrite active pool reserves
      const poolAlreadySeeded = existing.poolReserveToken > 0 && existing.poolReserveUsdc > 0;
      await prisma.marketToken.update({
        where: { symbol: token.symbol },
        data: {
          tokenId: token.tokenId,
          decimals: token.decimals,
          logoEmoji: token.logoEmoji,
          // Only seed pool reserves if they haven't been set (i.e. first run)
          ...(poolAlreadySeeded
            ? {}
            : { poolReserveToken: token.poolReserveToken, poolReserveUsdc: token.poolReserveUsdc }),
        },
      });
    } else {
      await prisma.marketToken.create({
        data: {
          id: `market-${token.symbol.toLowerCase()}`,
          symbol: token.symbol,
          name: token.name,
          tokenId: token.tokenId,
          decimals: token.decimals,
          priceUsdc: token.priceUsdc,
          logoEmoji: token.logoEmoji,
          isActive: true,
          poolReserveToken: token.poolReserveToken,
          poolReserveUsdc: token.poolReserveUsdc,
        },
      });
    }
  }

  // Mint initial HEC and HCC supply to treasury if token IDs are configured.
  // These are testnet-only tokens with no external price feed, so we seed the
  // treasury with enough to back the initial pool reserves.
  if (env.HEC_TOKEN_ID) {
    try {
      await mintFungibleTokens(env.HEC_TOKEN_ID, 500_000 * 100); // 500K tokens with 2 decimals → base units
      console.log('[market] Minted initial HEC supply to treasury');
    } catch (err) {
      console.warn('[market] HEC mint skipped (may already exist):', err instanceof Error ? err.message : err);
    }
  }
  if (env.HCC_TOKEN_ID) {
    try {
      await mintFungibleTokens(env.HCC_TOKEN_ID, 10_000_000 * 1_000_000); // 10M tokens with 6 decimals
      console.log('[market] Minted initial HCC supply to treasury');
    } catch (err) {
      console.warn('[market] HCC mint skipped (may already exist):', err instanceof Error ? err.message : err);
    }
  }
}

// ─── Live price refresh (CoinGecko free API, no key needed) ──────────────────

export async function refreshMarketPrices(): Promise<void> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd',
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const data = await res.json() as { 'hedera-hashgraph'?: { usd?: number } };
    const hbarUsd = data['hedera-hashgraph']?.usd;
    if (typeof hbarUsd === 'number' && hbarUsd > 0) {
      await prisma.marketToken.update({ where: { symbol: 'HBAR' }, data: { priceUsdc: hbarUsd } });
      console.log(`[market] HBAR price updated: $${hbarUsd}`);
    }
  } catch (err) {
    console.warn('[market] Price refresh failed (keeping cached price):', err instanceof Error ? err.message : err);
  }

  // Derive pool token prices from AMM reserves (x*y=k → price = reserveUsdc / reserveToken)
  const poolTokens = await prisma.marketToken.findMany({
    where: { symbol: { in: ['HNET', 'HEC', 'HCC'] }, isActive: true },
  });
  for (const t of poolTokens) {
    if (t.poolReserveToken > 0 && t.poolReserveUsdc > 0) {
      const derivedPrice = t.poolReserveUsdc / t.poolReserveToken;
      await prisma.marketToken.update({
        where: { symbol: t.symbol },
        data: { priceUsdc: derivedPrice },
      });
    }
  }
}

// ─── GET /market/tokens ────────────────────────────────────────────────────────

marketRouter.get('/tokens', async (_req, res, next) => {
  try {
    const tokens = await prisma.marketToken.findMany({
      where: { isActive: true },
      orderBy: { priceUsdc: 'desc' },
    });
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
});

// ─── GET /market/portfolio ─────────────────────────────────────────────────────

marketRouter.get('/portfolio', requireAuth, async (req, res, next) => {
  try {
    const accountId = req.user!.accountId;
    const tokens = await prisma.marketToken.findMany({ where: { isActive: true } });

    // Fetch on-chain balances in parallel
    const [hbarBalance, tokenBalances] = await Promise.all([
      getHbarBalance(accountId).catch(() => 0),
      getAccountTokenBalances(accountId).catch(() => []),
    ]);

    const portfolio = tokens.map((t) => {
      let balance = 0;
      if (t.symbol === 'HBAR') {
        balance = hbarBalance;
      } else if (t.tokenId) {
        const found = tokenBalances.find((b) => b.tokenId === t.tokenId);
        balance = found ? found.balance / Math.pow(10, t.decimals) : 0;
      }
      const valueUsdc = balance * t.priceUsdc;
      return { symbol: t.symbol, name: t.name, logoEmoji: t.logoEmoji, balance, priceUsdc: t.priceUsdc, valueUsdc };
    });

    const totalUsdc = portfolio.reduce((sum, p) => sum + p.valueUsdc, 0);
    res.json({ success: true, data: { portfolio, totalUsdc } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /market/faucet/eligibility ───────────────────────────────────────────

marketRouter.get('/faucet/eligibility', requireAuth, async (req, res, next) => {
  try {
    const accountId = req.user!.accountId;
    const cutoff = new Date(Date.now() - FAUCET_COOLDOWN_MS);
    const recentClaim = await prisma.faucetClaim.findFirst({
      where: { accountId, createdAt: { gte: cutoff } },
      orderBy: { createdAt: 'desc' },
    });

    const eligible = !recentClaim;
    const nextClaimAt = recentClaim
      ? new Date(recentClaim.createdAt.getTime() + FAUCET_COOLDOWN_MS)
      : null;

    res.json({ success: true, data: { eligible, nextClaimAt, amountUsdc: FAUCET_AMOUNT_USDC } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /market/faucet ───────────────────────────────────────────────────────

marketRouter.post('/faucet', requireAuth, async (req, res, next) => {
  try {
    const accountId = req.user!.accountId;
    const env = getEnv();

    // Rate limit: 1 claim per 24h
    const cutoff = new Date(Date.now() - FAUCET_COOLDOWN_MS);
    const recent = await prisma.faucetClaim.findFirst({
      where: { accountId, createdAt: { gte: cutoff } },
    });
    if (recent) {
      const nextAt = new Date(recent.createdAt.getTime() + FAUCET_COOLDOWN_MS);
      throw new AppError(429, `Faucet available again at ${nextAt.toISOString()}`);
    }

    let hederaTxId: string | null = null;

    // Attempt on-chain transfer if USDC token is deployed
    if (env.USDC_TOKEN_ID) {
      const user = await prisma.user.findUnique({ where: { hederaAccountId: accountId } });
      if (user?.hederaPrivateKey) {
        const userPrivKey = decrypt(user.hederaPrivateKey);
        try {
          // Associate USDC with user's account if needed
          await ensureTokenAssociated(accountId, env.USDC_TOKEN_ID, userPrivKey);
          // Mint fresh USDC to treasury
          const amountBase = Math.round(FAUCET_AMOUNT_USDC * 1e6);
          await mintFungibleTokens(env.USDC_TOKEN_ID, amountBase);
          // Transfer from treasury to user
          hederaTxId = await transferToken(env.USDC_TOKEN_ID, env.HEDERA_OPERATOR_ID, accountId, amountBase);
        } catch (err) {
          console.error('[market/faucet] on-chain transfer failed (continuing simulation):', err);
        }
      }
    }

    await prisma.faucetClaim.create({
      data: { id: crypto.randomUUID(), accountId, amountUsdc: FAUCET_AMOUNT_USDC },
    });

    res.json({
      success: true,
      data: { amountUsdc: FAUCET_AMOUNT_USDC, hederaTxId, simulated: !hederaTxId },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /market/swap ─────────────────────────────────────────────────────────

const swapSchema = z.object({
  fromSymbol: z.string().min(1).max(10).toUpperCase(),
  toSymbol: z.string().min(1).max(10).toUpperCase(),
  fromAmount: z.number().positive(),
});

// Pool tokens whose prices are determined by AMM reserves, not external feeds
const POOL_TOKENS = new Set(['HNET', 'HEC', 'HCC']);

marketRouter.post('/swap', requireAuth, validate(swapSchema), async (req, res, next) => {
  try {
    const { fromSymbol, toSymbol, fromAmount } = req.body as z.infer<typeof swapSchema>;
    const accountId = req.user!.accountId;
    const env = getEnv();

    if (fromSymbol === toSymbol) throw new AppError(400, 'Cannot swap a token for itself');

    const [fromToken, toToken] = await Promise.all([
      prisma.marketToken.findUnique({ where: { symbol: fromSymbol } }),
      prisma.marketToken.findUnique({ where: { symbol: toSymbol } }),
    ]);
    if (!fromToken) throw new AppError(400, `Unknown token: ${fromSymbol}`);
    if (!toToken) throw new AppError(400, `Unknown token: ${toSymbol}`);
    if (!fromToken.isActive || !toToken.isActive) throw new AppError(400, 'Token not available for trading');

    // ── Calculate output amount ──
    // For pool tokens (HNET/HEC/HCC) paired with USDC: use x*y=k AMM formula.
    // For everything else: use spot price ratio.
    let toAmount: number;
    const isPoolSwap =
      (POOL_TOKENS.has(fromSymbol) && toSymbol === 'USDC') ||
      (fromSymbol === 'USDC' && POOL_TOKENS.has(toSymbol));

    if (isPoolSwap) {
      const poolToken = POOL_TOKENS.has(fromSymbol) ? fromToken : toToken;
      if (poolToken.poolReserveToken <= 0 || poolToken.poolReserveUsdc <= 0) {
        throw new AppError(503, `${poolToken.symbol} pool not yet seeded — try again shortly`);
      }
      if (POOL_TOKENS.has(fromSymbol)) {
        // Selling pool token → buying USDC
        toAmount = ammGetAmountOut(fromAmount, poolToken.poolReserveToken, poolToken.poolReserveUsdc);
      } else {
        // Selling USDC → buying pool token
        toAmount = ammGetAmountOut(fromAmount, poolToken.poolReserveUsdc, poolToken.poolReserveToken);
      }
    } else {
      toAmount = (fromAmount * fromToken.priceUsdc) / toToken.priceUsdc;
    }

    // Minimum swap guard
    const valueUsdc = fromAmount * fromToken.priceUsdc;
    if (valueUsdc < 0.000001) throw new AppError(400, 'Swap amount too small');
    if (toAmount <= 0) throw new AppError(400, 'Swap output is zero — pool may be empty');

    const swapRecord = await prisma.swapTransaction.create({
      data: {
        id: crypto.randomUUID(),
        userAccountId: accountId,
        fromSymbol,
        toSymbol,
        fromAmount,
        toAmount,
        priceAtSwap: fromToken.priceUsdc,
        status: 'PENDING',
      },
    });

    let hederaTxId: string | null = null;
    let errorMsg: string | null = null;

    // Attempt on-chain settlement
    try {
      const user = await prisma.user.findUnique({ where: { hederaAccountId: accountId } });
      if (!user?.hederaPrivateKey) throw new Error('No private key on file for this account');

      const userPrivKey = decrypt(user.hederaPrivateKey);
      const operatorId = env.HEDERA_OPERATOR_ID;

      if (isPoolSwap) {
        // ── AMM pool swap (HNET/HEC/HCC ↔ USDC) ──
        const usdcId = env.USDC_TOKEN_ID;
        if (!usdcId) throw new Error('USDC token not configured');
        const poolToken = POOL_TOKENS.has(fromSymbol) ? fromToken : toToken;
        if (!poolToken.tokenId) throw new Error(`${poolToken.symbol} has no on-chain token ID`);

        // Ensure user is associated with both tokens
        await ensureTokenAssociated(accountId, usdcId, userPrivKey);
        await ensureTokenAssociated(accountId, poolToken.tokenId, userPrivKey);

        if (POOL_TOKENS.has(fromSymbol)) {
          // User sells pool token, receives USDC — ensure treasury has enough USDC
          const toAmountBase = Math.round(toAmount * Math.pow(10, toToken.decimals));
          // Mint USDC to treasury to cover the output
          await mintFungibleTokens(usdcId, toAmountBase);
          const fromAmountBase = Math.round(fromAmount * Math.pow(10, fromToken.decimals));
          hederaTxId = await atomicTokenForToken(
            fromToken.tokenId!, usdcId,
            accountId, userPrivKey, operatorId,
            fromAmountBase, toAmountBase,
          );
        } else {
          // User sells USDC, receives pool token — ensure treasury has enough pool token
          const toAmountBase = Math.round(toAmount * Math.pow(10, toToken.decimals));
          await mintFungibleTokens(poolToken.tokenId, toAmountBase);
          const fromAmountBase = Math.round(fromAmount * Math.pow(10, fromToken.decimals));
          hederaTxId = await atomicTokenForToken(
            usdcId, poolToken.tokenId,
            accountId, userPrivKey, operatorId,
            fromAmountBase, toAmountBase,
          );
        }

      } else if (fromSymbol === 'USDC' && toSymbol === 'HBAR' && fromToken.tokenId) {
        // Pre-flight: verify treasury has enough HBAR
        const treasuryHbar = await getHbarBalance(operatorId);
        if (treasuryHbar < toAmount + 1) {
          throw new Error(
            `Insufficient liquidity: pool has ${treasuryHbar.toFixed(2)} HBAR, swap requires ${toAmount.toFixed(2)} HBAR`,
          );
        }
        // Atomic: user sends USDC ↔ treasury sends HBAR
        await ensureTokenAssociated(accountId, fromToken.tokenId, userPrivKey);
        const fromAmountBase = Math.round(fromAmount * Math.pow(10, fromToken.decimals));
        hederaTxId = await atomicTokenForHbar(
          fromToken.tokenId, accountId, userPrivKey, operatorId, fromAmountBase, toAmount,
        );

      } else if (fromSymbol === 'HBAR' && toSymbol === 'USDC' && toToken.tokenId) {
        // Mint USDC to treasury first, then atomic swap
        await ensureTokenAssociated(accountId, toToken.tokenId, userPrivKey);
        const toAmountBase = Math.round(toAmount * Math.pow(10, toToken.decimals));
        await mintFungibleTokens(toToken.tokenId, toAmountBase);
        hederaTxId = await atomicHbarForToken(
          toToken.tokenId, accountId, userPrivKey, operatorId, fromAmount, toAmountBase,
        );

      } else {
        // Other pairs: 2-step (non-USDC, non-HBAR, non-pool)
        if (fromToken.tokenId) {
          await ensureTokenAssociated(accountId, fromToken.tokenId, userPrivKey);
        }
        if (toToken.tokenId) {
          await ensureTokenAssociated(accountId, toToken.tokenId, userPrivKey);
        }
        if (fromSymbol === 'HBAR') {
          await transferHbarFromUser(accountId, userPrivKey, operatorId, fromAmount);
        } else if (fromToken.tokenId) {
          const amountBase = Math.round(fromAmount * Math.pow(10, fromToken.decimals));
          await transferTokenFromUser(fromToken.tokenId, accountId, userPrivKey, operatorId, amountBase);
        }
        if (toSymbol === 'HBAR') {
          hederaTxId = await transferHbar(operatorId, accountId, toAmount);
        } else if (toToken.tokenId) {
          const toAmountBase = Math.round(toAmount * Math.pow(10, toToken.decimals));
          hederaTxId = await transferToken(toToken.tokenId, operatorId, accountId, toAmountBase);
        }
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'On-chain settlement failed';
      console.error('[market/swap] on-chain error:', errorMsg);
    }

    const finalStatus = errorMsg && !hederaTxId ? 'FAILED' : 'SUCCESS';

    await prisma.swapTransaction.update({
      where: { id: swapRecord.id },
      data: { status: finalStatus, hederaTxId, errorMsg },
    });

    // ── Update AMM pool reserves after a successful pool swap ──
    if (finalStatus === 'SUCCESS' && isPoolSwap) {
      const poolToken = POOL_TOKENS.has(fromSymbol) ? fromToken : toToken;
      const current = await prisma.marketToken.findUnique({ where: { symbol: poolToken.symbol } });
      if (current && current.poolReserveToken > 0 && current.poolReserveUsdc > 0) {
        let newReserveToken: number;
        let newReserveUsdc: number;
        if (POOL_TOKENS.has(fromSymbol)) {
          // Pool token in, USDC out
          newReserveToken = current.poolReserveToken + fromAmount;
          newReserveUsdc = current.poolReserveUsdc - toAmount;
        } else {
          // USDC in, pool token out
          newReserveToken = current.poolReserveToken - toAmount;
          newReserveUsdc = current.poolReserveUsdc + fromAmount;
        }
        // Clamp to avoid negative reserves (shouldn't happen but guard anyway)
        newReserveToken = Math.max(newReserveToken, 1e-8);
        newReserveUsdc = Math.max(newReserveUsdc, 1e-8);
        const newPrice = newReserveUsdc / newReserveToken;
        await prisma.marketToken.update({
          where: { symbol: poolToken.symbol },
          data: {
            poolReserveToken: newReserveToken,
            poolReserveUsdc: newReserveUsdc,
            priceUsdc: newPrice,
          },
        });
      }
    }

    // Record in global transaction log
    await prisma.transaction.create({
      data: {
        type: 'SWAP',
        fromAccount: accountId,
        toAccount: accountId,
        amountHbar: fromSymbol === 'HBAR' ? fromAmount : toSymbol === 'HBAR' ? toAmount : 0,
        txHashHedera: hederaTxId,
        status: finalStatus === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
      },
    });

    res.json({
      success: true,
      data: {
        id: swapRecord.id,
        fromSymbol,
        toSymbol,
        fromAmount,
        toAmount,
        status: finalStatus,
        hederaTxId,
        simulated: !hederaTxId,
        errorMsg,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /market/swaps ─────────────────────────────────────────────────────────

marketRouter.get('/swaps', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query['limit'] ?? 20), 50);
    const swaps = await prisma.swapTransaction.findMany({
      where: { userAccountId: req.user!.accountId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ success: true, data: swaps });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /market/tokens/:symbol (admin) ─────────────────────────────────────

marketRouter.patch(
  '/tokens/:symbol',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const symbol = req.params['symbol']!.toUpperCase();
      const { priceUsdc } = req.body as { priceUsdc?: number };
      if (typeof priceUsdc !== 'number' || priceUsdc <= 0) {
        throw new AppError(400, 'priceUsdc must be a positive number');
      }
      const token = await prisma.marketToken.update({
        where: { symbol },
        data: { priceUsdc },
      });
      res.json({ success: true, data: token });
    } catch (err) {
      next(err);
    }
  },
);
