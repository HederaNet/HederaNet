/**
 * Simplified Hedera operations for USSD context.
 * All operations are designed to complete in <5s for USSD timeout constraints.
 */
import { getAccountInfo, getTopicMessages } from './mirror.service.js';
import { transferHbar } from './token.service.js';
import { publishMessage } from './consensus.service.js';

export async function ussdGetBalance(accountId: string): Promise<{
  hbar: number;
  hnet: number;
  hec: number;
}> {
  const account = await getAccountInfo(accountId);
  const hnetToken = account.tokens.find((t) => t.tokenId === process.env['HNET_TOKEN_ID']);
  const hecToken = account.tokens.find((t) => t.tokenId === process.env['HEC_TOKEN_ID']);

  return {
    hbar: account.balance,
    hnet: hnetToken?.balance ?? 0,
    hec: hecToken?.balance ?? 0,
  };
}

export async function ussdGetRecentTransactions(
  accountId: string,
): Promise<Array<{ amount: number; from: string; to: string; date: string }>> {
  const txs = await getTopicMessages(process.env['ENERGY_TRADING_TOPIC_ID'] ?? '', 3);
  return txs.map((t) => {
    let parsed: { amount?: number; from?: string; to?: string } = {};
    try {
      parsed = JSON.parse(t.message) as typeof parsed;
    } catch {
      // ignore malformed messages
    }
    return {
      amount: parsed.amount ?? 0,
      from: parsed.from ?? 'unknown',
      to: parsed.to ?? 'unknown',
      date: t.consensusTimestamp,
    };
  });
}

export async function ussdTransferHbar(
  fromAccountId: string,
  toAccountId: string,
  amountHbar: number,
): Promise<{ success: boolean; txId: string }> {
  const txId = await transferHbar(fromAccountId, toAccountId, amountHbar);
  return { success: true, txId };
}

export async function ussdPublishEnergyReading(
  topicId: string,
  deviceId: string,
  kwhDelivered: number,
): Promise<string> {
  return publishMessage(
    topicId,
    JSON.stringify({
      type: 'ENERGY_DELIVERY',
      deviceId,
      kwhDelivered,
      timestamp: new Date().toISOString(),
    }),
  );
}
