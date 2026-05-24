import {
  Client,
  AccountId,
  PrivateKey,
} from '@hashgraph/sdk';

export interface HederaClientConfig {
  network: 'testnet' | 'mainnet' | 'previewnet';
  operatorId: string;
  operatorPrivateKey: string;
}

let _client: Client | null = null;
let _clientConfig: HederaClientConfig | null = null;

export function getHederaClient(config?: HederaClientConfig): Client {
  if (_client && !config) return _client;

  const cfg = config ?? _clientConfig;
  if (!cfg) throw new Error('Hedera client not initialized. Call initHederaClient() first.');

  let client: Client;
  switch (cfg.network) {
    case 'mainnet':
      client = Client.forMainnet();
      break;
    case 'previewnet':
      client = Client.forPreviewnet();
      break;
    default:
      client = Client.forTestnet();
  }

  const privKey = cfg.operatorPrivateKey.startsWith('0x') || /^[0-9a-fA-F]{64}$/.test(cfg.operatorPrivateKey)
    ? PrivateKey.fromStringECDSA(cfg.operatorPrivateKey.replace(/^0x/, ''))
    : PrivateKey.fromString(cfg.operatorPrivateKey);

  client.setOperator(AccountId.fromString(cfg.operatorId), privKey);

  client.setMaxAttempts(10);
  client.setMaxNodeAttempts(3);

  _client = client;
  _clientConfig = cfg;
  return client;
}

export function initHederaClient(config: HederaClientConfig): Client | null {
  _client = null;
  _clientConfig = config;
  try {
    return getHederaClient(config);
  } catch (err) {
    console.warn('[HederaNet] Hedera client not initialized (placeholder credentials detected). On-chain features will be unavailable until real credentials are configured.');
    return null;
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 5,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxAttempts) break;

      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100;
      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
