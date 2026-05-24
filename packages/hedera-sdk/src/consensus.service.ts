import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
  Status,
} from '@hashgraph/sdk';
import type { HCSMessage } from '@hederanet/types';
import { getHederaClient, withRetry } from './hedera.service.js';

export async function createTopic(memo?: string): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = await new TopicCreateTransaction()
      .setTopicMemo(memo ?? '')
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Topic creation failed: ${receipt.status.toString()}`);
    }
    if (!receipt.topicId) throw new Error('No topic ID in receipt');
    return receipt.topicId.toString();
  });
}

export async function publishMessage(topicId: string, message: string | Uint8Array): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(message)
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Message publish failed: ${receipt.status.toString()}`);
    }
    return tx.transactionId.toString();
  });
}

export function subscribeToTopic(
  topicId: string,
  onMessage: (message: HCSMessage) => void,
  onError?: (err: Error) => void,
): { unsubscribe: () => void } {
  const client = getHederaClient();
  const query = new TopicMessageQuery()
    .setTopicId(TopicId.fromString(topicId))
    .setStartTime(0);

  // SDK signature: subscribe(client, errorHandler(msg|null, err), listener(msg))
  const handle = query.subscribe(
    client,
    (_msg, err) => {
      if (onError) onError(err);
      else console.error('HCS subscription error:', err);
    },
    (message) => {
      if (!message) return;
      onMessage({
        consensusTimestamp: message.consensusTimestamp?.toDate().toISOString() ?? new Date().toISOString(),
        message: message.contents ? Buffer.from(message.contents).toString('utf-8') : '',
        sequenceNumber: message.sequenceNumber ? Number(message.sequenceNumber) : 0,
        topicId,
      });
    },
  );

  return {
    unsubscribe: () => handle.unsubscribe(),
  };
}

export async function publishIoTReading(
  topicId: string,
  deviceId: string,
  readingType: string,
  value: number,
  unit: string,
): Promise<string> {
  const payload = JSON.stringify({
    deviceId,
    readingType,
    value,
    unit,
    timestamp: new Date().toISOString(),
  });
  return publishMessage(topicId, payload);
}

export async function publishGovernanceVote(
  topicId: string,
  proposalId: string,
  voterAccountId: string,
  choice: string,
  txHash: string,
): Promise<string> {
  const payload = JSON.stringify({
    proposalId,
    voterAccountId,
    choice,
    txHash,
    timestamp: new Date().toISOString(),
  });
  return publishMessage(topicId, payload);
}
