// ─── Enums ────────────────────────────────────────────────────────────────────

export enum OperatorTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export enum TradeStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum UserRole {
  SUBSCRIBER = 'SUBSCRIBER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

export enum TransactionType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ENERGY_TRADE = 'ENERGY_TRADE',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  REWARD = 'REWARD',
  WITHDRAWAL = 'WITHDRAWAL',
  GOVERNANCE = 'GOVERNANCE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
}

export enum VoteChoice {
  YES = 'YES',
  NO = 'NO',
  ABSTAIN = 'ABSTAIN',
}

export enum IoTReadingType {
  ENERGY_DELIVERY = 'ENERGY_DELIVERY',
  NETWORK_UPTIME = 'NETWORK_UPTIME',
  COMPUTE_JOB = 'COMPUTE_JOB',
  SOLAR_GENERATION = 'SOLAR_GENERATION',
}

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  hederaAccountId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  userId: string;
  hederaAccountId: string;
  tier: OperatorTier;
  stakedHbar: number;
  reputationScore: number;
  country: string;
  city: string;
  lat: number;
  lng: number;
  createdAt: string;
  user?: User;
  hotspots?: Hotspot[];
  solarInstallations?: SolarInstallation[];
}

export interface Hotspot {
  id: string;
  operatorId: string;
  hcsTopicId: string;
  lat: number;
  lng: number;
  coverageRadiusMeters: number;
  monthlyPriceHbar: number;
  isActive: boolean;
  installedAt: string;
  uptimePct30d: number;
  operator?: Operator;
  subscriptions?: Subscription[];
}

export interface SolarInstallation {
  id: string;
  operatorId: string;
  capacityKw: number;
  lat: number;
  lng: number;
  hcsTopicId: string;
  isActive: boolean;
  createdAt: string;
  operator?: Operator;
  listings?: EnergyListing[];
}

export interface EnergyListing {
  id: string;
  installationId: string;
  pricePerKwhHbar: number;
  availableUnits: number;
  isActive: boolean;
  createdAt: string;
  installation?: SolarInstallation;
}

export interface EnergyTrade {
  id: string;
  listingId: string;
  buyerAccountId: string;
  sellerAccountId: string;
  units: number;
  totalHbar: number;
  status: TradeStatus;
  contractTradeId: string | null;
  confirmedAt: string | null;
  createdAt: string;
  listing?: EnergyListing;
  iotReadings?: IoTReading[];
}

export interface Subscription {
  id: string;
  subscriberAccountId: string;
  hotspotId: string;
  nftTokenId: string | null;
  startsAt: string;
  expiresAt: string;
  status: SubscriptionStatus;
  hotspot?: Hotspot;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromAccount: string;
  toAccount: string | null;
  amountHbar: number;
  contractId: string | null;
  txHashHedera: string | null;
  status: TransactionStatus;
  createdAt: string;
}

export interface Proposal {
  id: string;
  proposerAccountId: string;
  title: string;
  description: string;
  votingEndsAt: string;
  status: ProposalStatus;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  createdAt: string;
  userVote?: VoteChoice | null;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterAccountId: string;
  choice: VoteChoice;
  votingPower: number;
  txHashHedera: string | null;
  createdAt: string;
}

export interface IoTReading {
  id: string;
  deviceId: string;
  readingType: IoTReadingType;
  value: number;
  unit: string;
  confirmedOnChain: boolean;
  hcsMessageId: string | null;
  timestamp: string;
}

export interface NetworkStats {
  totalActiveHotspots: number;
  totalUsers: number;
  totalOperators: number;
  energyTradedKwhToday: number;
  totalHbarSettled: number;
  totalSubscriptions: number;
  recordedAt: string;
}

// ─── Hedera Types ─────────────────────────────────────────────────────────────

export interface HederaAccount {
  accountId: string;
  balance: number;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  tokenId: string;
  balance: number;
  decimals: number;
  symbol: string;
}

export interface ContractCallResult {
  txId: string;
  status: 'SUCCESS' | 'FAILED';
  result?: unknown;
  error?: string;
}

export interface HCSMessage {
  consensusTimestamp: string;
  message: string;
  sequenceNumber: number;
  topicId: string;
}

export interface MirrorTransaction {
  transactionId: string;
  validStartTimestamp: string;
  charged_tx_fee: number;
  transfers: Array<{
    account: string;
    amount: number;
  }>;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface WalletAuthRequest {
  accountId: string;
  signature: string;
  publicKey: string;
  message: string;
}

export interface RegisterOperatorRequest {
  country: string;
  city: string;
  lat: number;
  lng: number;
}

export interface CreateHotspotRequest {
  lat: number;
  lng: number;
  coverageRadiusMeters: number;
  monthlyPriceHbar: number;
}

export interface CreateEnergyListingRequest {
  installationId: string;
  pricePerKwhHbar: number;
  availableUnits: number;
}

export interface InitiateEnergyTradeRequest {
  listingId: string;
  units: number;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  votingPeriodDays: number;
}

export interface CastVoteRequest {
  proposalId: string;
  choice: VoteChoice;
  txHashHedera: string;
}

// ─── WebSocket Event Types ────────────────────────────────────────────────────

export interface HotspotUptimeEvent {
  hotspotId: string;
  uptimePct: number;
  isOnline: boolean;
  timestamp: string;
}

export interface PaymentReceivedEvent {
  operatorAccountId: string;
  amountHbar: number;
  from: string;
  txHash: string;
  type: TransactionType;
}

export interface TradeStatusEvent {
  tradeId: string;
  status: TradeStatus;
  txHash?: string;
}

export interface NetworkStatsEvent extends NetworkStats {
  deltaHotspots: number;
  deltaUsers: number;
}

// ─── USSD Types ───────────────────────────────────────────────────────────────

export interface UssdSession {
  sessionId: string;
  phoneNumber: string;
  accountId: string | null;
  menuState: string;
  data: Record<string, string>;
  createdAt: number;
}

export interface UssdRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export interface UssdResponse {
  text: string;
  isEnd: boolean;
}
