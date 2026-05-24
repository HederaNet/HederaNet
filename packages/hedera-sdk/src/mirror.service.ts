import axios from 'axios';
import type { HederaAccount, MirrorTransaction, HCSMessage } from '@hederanet/types';

let _mirrorNodeBaseUrl = 'https://testnet.mirrornode.hedera.com';

export function setMirrorNodeBaseUrl(url: string): void {
  _mirrorNodeBaseUrl = url;
}

export function getMirrorNodeBaseUrl(): string {
  return _mirrorNodeBaseUrl;
}

export async function getAccountInfo(accountId: string): Promise<HederaAccount> {
  const response = await axios.get<{
    account: string;
    balance: { balance: number };
    tokens?: { tokens: Array<{ token_id: string; balance: number; decimals: number }> };
  }>(`${_mirrorNodeBaseUrl}/api/v1/accounts/${accountId}`);

  const { data } = response;
  return {
    accountId: data.account,
    balance: data.balance.balance / 1e8,
    tokens: (data.tokens?.tokens ?? []).map((t) => ({
      tokenId: t.token_id,
      balance: t.balance,
      decimals: t.decimals,
      symbol: '',
    })),
  };
}

export async function getAccountTransactions(
  accountId: string,
  limit = 25,
  order: 'asc' | 'desc' = 'desc',
): Promise<MirrorTransaction[]> {
  const response = await axios.get<{
    transactions: Array<{
      transaction_id: string;
      valid_start_timestamp: string;
      charged_tx_fee: number;
      transfers: Array<{ account: string; amount: number }>;
    }>;
  }>(`${_mirrorNodeBaseUrl}/api/v1/transactions`, {
    params: { 'account.id': accountId, limit, order },
  });

  return response.data.transactions.map((t) => ({
    transactionId: t.transaction_id,
    validStartTimestamp: t.valid_start_timestamp,
    charged_tx_fee: t.charged_tx_fee,
    transfers: t.transfers,
  }));
}

export async function getTopicMessages(
  topicId: string,
  limit = 100,
  sequenceNumberGte?: number,
): Promise<HCSMessage[]> {
  const params: Record<string, string | number> = { limit, order: 'asc' };
  if (sequenceNumberGte !== undefined) {
    params['sequencenumber'] = `gte:${sequenceNumberGte}`;
  }

  const response = await axios.get<{
    messages: Array<{
      consensus_timestamp: string;
      message: string;
      sequence_number: number;
      topic_id: string;
    }>;
  }>(`${_mirrorNodeBaseUrl}/api/v1/topics/${topicId}/messages`, { params });

  return response.data.messages.map((m) => ({
    consensusTimestamp: m.consensus_timestamp,
    message: Buffer.from(m.message, 'base64').toString('utf-8'),
    sequenceNumber: m.sequence_number,
    topicId: m.topic_id,
  }));
}

export async function getTokenInfo(tokenId: string): Promise<{
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}> {
  const response = await axios.get<{
    token_id: string;
    name: string;
    symbol: string;
    decimals: string;
    total_supply: string;
  }>(`${_mirrorNodeBaseUrl}/api/v1/tokens/${tokenId}`);

  const d = response.data;
  return {
    tokenId: d.token_id,
    name: d.name,
    symbol: d.symbol,
    decimals: parseInt(d.decimals, 10),
    totalSupply: parseInt(d.total_supply, 10),
  };
}

export async function getNetworkTps(): Promise<number> {
  const response = await axios.get<{
    tps: string;
  }>(`${_mirrorNodeBaseUrl}/api/v1/network/supply`);
  return parseFloat(response.data.tps ?? '0');
}
