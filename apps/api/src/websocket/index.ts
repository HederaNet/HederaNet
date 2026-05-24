import type { Server as SocketIOServer } from 'socket.io';
import type { PrismaClient } from '@prisma/client';

export function setupSocketIO(io: SocketIOServer, prisma: PrismaClient): void {
  io.on('connection', (socket) => {
    const { accountId } = socket.handshake.query as { accountId?: string };

    // Subscribe to personal operator channel
    if (accountId) {
      void socket.join(`operator:${accountId}`);
    }

    socket.on('subscribe:hotspot', (hotspotId: string) => {
      void socket.join(`hotspot:${hotspotId}`);
    });

    socket.on('subscribe:trade', (tradeId: string) => {
      void socket.join(`trade:${tradeId}`);
    });

    socket.on('disconnect', () => {
      // Cleanup handled by socket.io
    });
  });

  // Broadcast network stats every 60s
  setInterval(() => {
    void broadcastNetworkStats(io, prisma);
  }, 60_000);
}

async function broadcastNetworkStats(io: SocketIOServer, prisma: PrismaClient): Promise<void> {
  try {
    const [hotspots, users, todayTrades] = await Promise.all([
      prisma.hotspot.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.energyTrade.aggregate({
        _sum: { units: true, totalHbar: true },
        where: { createdAt: { gte: new Date(Date.now() - 86400_000) } },
      }),
    ]);

    io.to('network:stats').emit('network:stats', {
      totalActiveHotspots: hotspots,
      totalUsers: users,
      energyTradedKwhToday: todayTrades._sum.units ?? 0,
      totalHbarSettled: todayTrades._sum.totalHbar ?? 0,
      recordedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to broadcast stats:', err);
  }
}

export function emitPaymentReceived(
  io: SocketIOServer,
  operatorAccountId: string,
  data: { amountHbar: number; from: string; txHash: string; type: string },
): void {
  io.to(`operator:${operatorAccountId}`).emit('payment_received', data);
}

export function emitHotspotUptime(
  io: SocketIOServer,
  hotspotId: string,
  data: { uptimePct: number; isOnline: boolean },
): void {
  io.to(`hotspot:${hotspotId}`).emit('uptime_ping', { hotspotId, ...data, timestamp: new Date().toISOString() });
}

export function emitTradeStatus(
  io: SocketIOServer,
  tradeId: string,
  data: { status: string; txHash?: string },
): void {
  io.to(`trade:${tradeId}`).emit('trade_status_update', { tradeId, ...data });
}
