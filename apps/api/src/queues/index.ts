import { Queue, Worker } from 'bullmq';
import type { PrismaClient } from '@prisma/client';
import type { Server as SocketIOServer } from 'socket.io';
import { getEnv } from '@hederanet/config';

const connection = { host: 'localhost', port: 6379 };

export function createQueue(name: string): Queue {
  return new Queue(name, { connection });
}

export const hederaTxQueue = createQueue('hedera-transactions');
export const iotReadingsQueue = createQueue('iot-readings');
export const statsRefreshQueue = createQueue('stats-refresh');

export async function startQueues(prisma: PrismaClient, io: SocketIOServer): Promise<void> {
  const env = getEnv();

  // Hedera TX retry worker
  new Worker(
    'hedera-transactions',
    async (job) => {
      const { txId, type } = job.data as { txId: string; type: string };
      console.log(`Processing Hedera TX: ${txId} [${type}]`);
      await prisma.transaction.updateMany({
        where: { txHashHedera: txId, status: 'PENDING' },
        data: { status: 'SUCCESS' },
      });
    },
    { connection },
  );

  // IoT readings worker
  new Worker(
    'iot-readings',
    async (job) => {
      const { deviceId, readingType, value, unit, tradeId } = job.data as {
        deviceId: string;
        readingType: string;
        value: number;
        unit: string;
        tradeId?: string;
      };

      await prisma.ioTReading.create({
        data: {
          deviceId,
          readingType: readingType as 'ENERGY_DELIVERY' | 'NETWORK_UPTIME' | 'COMPUTE_JOB' | 'SOLAR_GENERATION',
          value,
          unit,
          tradeId: tradeId ?? null,
          confirmedOnChain: false,
          timestamp: new Date(),
        },
      });

      if (tradeId && readingType === 'ENERGY_DELIVERY') {
        await prisma.energyTrade.update({ where: { id: tradeId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
        io.to(`trade:${tradeId}`).emit('trade_status_update', { tradeId, status: 'CONFIRMED' });
      }
    },
    { connection },
  );

  // Stats refresh worker (every 60s)
  new Worker(
    'stats-refresh',
    async () => {
      const [hotspots, users, operators, trades, subscriptions] = await Promise.all([
        prisma.hotspot.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.operator.count(),
        prisma.energyTrade.aggregate({ _sum: { units: true, totalHbar: true }, where: { createdAt: { gte: new Date(Date.now() - 86400_000) } } }),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      ]);

      await prisma.networkStats.create({
        data: {
          totalActiveHotspots: hotspots,
          totalUsers: users,
          totalOperators: operators,
          energyTradedKwhToday: trades._sum.units ?? 0,
          totalHbarSettled: trades._sum.totalHbar ?? 0,
          totalSubscriptions: subscriptions,
        },
      });
    },
    { connection },
  );

  // Schedule recurring stats refresh
  await statsRefreshQueue.add('refresh', {}, { repeat: { every: 60_000 } });

  console.log('BullMQ workers started');

  // Suppress unused variable warning
  void env;
}
