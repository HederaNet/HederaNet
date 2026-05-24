import { Router } from 'express';
import { prisma } from '../index.js';
import type { ApiResponse, NetworkStats } from '@hederanet/types';

export const networkRouter: Router = Router();

let cachedStats: NetworkStats | null = null;
let cacheExpiry = 0;

networkRouter.get('/stats', async (_req, res, next) => {
  try {
    const now = Date.now();
    if (cachedStats && now < cacheExpiry) {
      res.json({ success: true, data: cachedStats });
      return;
    }

    const [hotspots, users, operators, trades, subscriptions] = await Promise.all([
      prisma.hotspot.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.operator.count(),
      prisma.energyTrade.aggregate({
        _sum: { units: true, totalHbar: true },
        where: { createdAt: { gte: new Date(Date.now() - 86400_000) } },
      }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    const stats: NetworkStats = {
      totalActiveHotspots: hotspots,
      totalUsers: users,
      totalOperators: operators,
      energyTradedKwhToday: trades._sum.units ?? 0,
      totalHbarSettled: trades._sum.totalHbar ?? 0,
      totalSubscriptions: subscriptions,
      recordedAt: new Date().toISOString(),
    };

    cachedStats = stats;
    cacheExpiry = now + 60_000;

    const response: ApiResponse<NetworkStats> = { success: true, data: stats };
    res.json(response);
  } catch (err) {
    next(err);
  }
});
