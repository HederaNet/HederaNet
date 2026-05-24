import { z } from 'zod';

const hederaAccountIdSchema = z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be a valid Hedera account ID (x.y.z)');

const envSchema = z.object({
  // Hedera Network
  HEDERA_NETWORK: z.enum(['testnet', 'mainnet', 'previewnet']).default('testnet'),
  HEDERA_OPERATOR_ID: hederaAccountIdSchema,
  HEDERA_OPERATOR_PRIVATE_KEY: z.string().min(1, 'Hedera operator private key is required'),
  HEDERA_MIRROR_NODE_URL: z
    .string()
    .url()
    .default('https://testnet.mirrornode.hedera.com'),

  // Database
  DATABASE_URL: z.string().url('Must be a valid PostgreSQL connection URL'),

  // Redis
  REDIS_URL: z.string().url('Must be a valid Redis connection URL').default('redis://localhost:6379'),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Token IDs (testnet defaults)
  HNET_TOKEN_ID: hederaAccountIdSchema.default('0.0.7153593'),
  HEC_TOKEN_ID: hederaAccountIdSchema.default('0.0.7153605'),
  HCC_TOKEN_ID: hederaAccountIdSchema.default('0.0.7153651'),
  REPUTATION_NFT_ID: hederaAccountIdSchema.default('0.0.7153666'),
  // Our custom testnet USDC (deploy via: pnpm tsx src/scripts/deploy-usdc.ts)
  USDC_TOKEN_ID: hederaAccountIdSchema.optional(),

  // Contract IDs (testnet defaults)
  ENERGY_TRADING_CONTRACT_ID: hederaAccountIdSchema.default('0.0.7153712'),
  SERVICE_PAYMENT_CONTRACT_ID: hederaAccountIdSchema.default('0.0.7153764'),
  GOVERNANCE_CONTRACT_ID: hederaAccountIdSchema.default('0.0.7153782'),

  // Topic IDs (testnet defaults)
  GOVERNANCE_TOPIC_ID: hederaAccountIdSchema.default('0.0.1006'),
  SERVICE_QUALITY_TOPIC_ID: hederaAccountIdSchema.default('0.0.1005'),
  ENERGY_TRADING_TOPIC_ID: hederaAccountIdSchema.default('0.0.1007'),

  // Web app
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // USSD
  USSD_PROVIDER_KEY: z.string().optional(),
  AFRICAS_TALKING_USERNAME: z.string().optional(),
  AFRICAS_TALKING_API_KEY: z.string().optional(),

  // Auth
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Optional integrations
  SENTRY_DSN: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  MAPBOX_PUBLIC_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),

  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${errors}`);
  }
  _env = result.data;
  return _env;
}

export function validateEnv(): void {
  getEnv();
}

export { envSchema };
