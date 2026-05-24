import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const transactionsRouter: Router = Router();

// ─── GET /transactions — public feed of all recent on-chain transactions ───────

transactionsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query['page'] ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query['limit'] ?? 20)));
    const typeFilter = req.query['type'] as string | undefined;

    const where = typeFilter ? { type: typeFilter as never } : {};

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Enrich SWAP transactions with token-level detail
    const swapHashes = transactions
      .filter((t) => t.type === 'SWAP' && t.txHashHedera)
      .map((t) => t.txHashHedera!);

    const swapDetails =
      swapHashes.length > 0
        ? await prisma.swapTransaction.findMany({ where: { hederaTxId: { in: swapHashes } } })
        : [];
    const swapByHash = Object.fromEntries(swapDetails.map((s) => [s.hederaTxId, s]));

    const hbarToken = await prisma.marketToken.findUnique({ where: { symbol: 'HBAR' } });
    const hbarPriceUsdc = hbarToken?.priceUsdc ?? 0.09;

    const enriched = transactions.map((tx) => ({
      ...tx,
      swapDetail:
        tx.type === 'SWAP' && tx.txHashHedera ? (swapByHash[tx.txHashHedera] ?? null) : null,
      valueUsdc: tx.amountHbar * hbarPriceUsdc,
    }));

    res.json({
      success: true,
      data: {
        transactions: enriched,
        hbarPriceUsdc,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /transactions/:accountId — authed, per-account history ───────────────

transactionsRouter.get('/:accountId', requireAuth, async (req, res, next) => {
  try {
    const accountId = req.params['accountId']!;
    if (accountId !== req.user!.accountId && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'Access denied');
    }

    const page = Number(req.query['page'] ?? 1);
    const limit = Number(req.query['limit'] ?? 25);

    const [txs, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { OR: [{ fromAccount: accountId }, { toAccount: accountId }] },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: { OR: [{ fromAccount: accountId }, { toAccount: accountId }] } }),
    ]);

    res.json({ success: true, data: txs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});
