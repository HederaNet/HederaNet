import { AccountCreateTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';
import { getHederaClient, withRetry } from './hedera.service.js';

export interface CreatedHederaAccount {
  accountId: string;
  privateKeyHex: string;
  publicKeyHex: string;
}

export async function createHederaAccount(): Promise<CreatedHederaAccount> {
  return withRetry(async () => {
    const client = getHederaClient();
    const newKey = PrivateKey.generateECDSA();

    const tx = await new AccountCreateTransaction()
      .setKey(newKey.publicKey)
      .setInitialBalance(new Hbar(1))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (!receipt.accountId) throw new Error('No accountId in receipt after account creation');

    return {
      accountId: receipt.accountId.toString(),
      privateKeyHex: newKey.toStringRaw(),
      publicKeyHex: newKey.publicKey.toStringRaw(),
    };
  }, 3, 1000);
}
