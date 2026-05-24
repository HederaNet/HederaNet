import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const activeHotspots = new client.Gauge({
  name: 'hederanet_active_hotspots',
  help: 'Number of currently active hotspot nodes',
  registers: [register],
});

export const tradeVolumeHbar = new client.Counter({
  name: 'hederanet_trade_volume_hbar',
  help: 'Total HBAR settled in energy trades',
  registers: [register],
});

export const iotReadingsTotal = new client.Counter({
  name: 'hederanet_iot_readings_total',
  help: 'Total IoT readings processed',
  labelNames: ['type', 'confirmed'] as const,
  registers: [register],
});

export const subscriptionsActive = new client.Gauge({
  name: 'hederanet_subscriptions_active',
  help: 'Number of active subscriptions',
  registers: [register],
});

export const apiRequestDuration = new client.Histogram({
  name: 'hederanet_api_request_duration_seconds',
  help: 'API request duration in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export const hederaTxTotal = new client.Counter({
  name: 'hederanet_hedera_tx_total',
  help: 'Total Hedera transactions submitted',
  labelNames: ['type', 'status'] as const,
  registers: [register],
});

export { register };
