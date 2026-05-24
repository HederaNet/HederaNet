import 'dotenv/config.js';
import { initDatabase } from './lib/db-init.js';
import { validateEnv, getEnv } from '@hederanet/config';

await initDatabase();
validateEnv();

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { initHederaClient } from '@hederanet/hedera-sdk';
import { setMirrorNodeBaseUrl } from '@hederanet/hedera-sdk';

import { errorHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { rateLimiter } from './middleware/rateLimiter.js';

import { authRouter } from './routes/auth.js';
import { networkRouter } from './routes/network.js';
import { hotspotsRouter } from './routes/hotspots.js';
import { operatorsRouter } from './routes/operators.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { energyRouter } from './routes/energy.js';
import { governanceRouter } from './routes/governance.js';
import { transactionsRouter } from './routes/transactions.js';
import { metricsRouter } from './routes/metrics.js';
import { marketRouter, seedMarketTokens, refreshMarketPrices } from './routes/market.js';

import { setupSocketIO } from './websocket/index.js';
import { startQueues } from './queues/index.js';
import { register } from './metrics.js';

const env = getEnv();

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

const hederaClient = initHederaClient({
  network: env.HEDERA_NETWORK,
  operatorId: env.HEDERA_OPERATOR_ID,
  operatorPrivateKey: env.HEDERA_OPERATOR_PRIVATE_KEY,
});
void hederaClient;

setMirrorNodeBaseUrl(env.HEDERA_MIRROR_NODE_URL);

const app = express();
const httpServer = createServer(app);

// Trust proxy for rate limiting / IP detection
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.NEXT_PUBLIC_APP_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestId());
app.use(rateLimiter());

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', network: env.HEDERA_NETWORK, timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/network', networkRouter);
app.use('/hotspots', hotspotsRouter);
app.use('/operators', operatorsRouter);
app.use('/subscriptions', subscriptionsRouter);
app.use('/energy', energyRouter);
app.use('/governance', governanceRouter);
app.use('/transactions', transactionsRouter);
app.use('/metrics', metricsRouter);
app.use('/market', marketRouter);

app.use(errorHandler());

// Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: { origin: env.NEXT_PUBLIC_APP_URL, credentials: true },
  transports: ['websocket', 'polling'],
});

setupSocketIO(io, prisma);

// Queues
await startQueues(prisma, io);

// Seed market tokens (idempotent upserts) then fetch live prices
await seedMarketTokens().catch((err) => console.error('[market] seed failed:', err));
await refreshMarketPrices();
// Refresh HBAR price every 5 minutes
setInterval(() => { void refreshMarketPrices(); }, 5 * 60_000);

const port = env.PORT;
httpServer.listen(port, () => {
  console.log(`HederaNet API running on port ${port} [${env.NODE_ENV}]`);
  console.log(`Hedera network: ${env.HEDERA_NETWORK}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

export { io };
export type { SocketIOServer };
