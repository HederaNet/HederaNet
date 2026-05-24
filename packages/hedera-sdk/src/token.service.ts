import {
  TokenAssociateTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TransferTransaction,
  TokenMintTransaction,
  TokenId,
  AccountId,
  PrivateKey,
  Hbar,
  Status,
} from '@hashgraph/sdk';
import type { TokenBalance } from '@hederanet/types';
import { getHederaClient, withRetry } from './hedera.service.js';
import { getMirrorNodeBaseUrl } from './mirror.service.js';
import axios from 'axios';

export async function associateToken(accountId: string, tokenId: string): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = await new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds([TokenId.fromString(tokenId)])
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Token association failed: ${receipt.status.toString()}`);
    }
    return tx.transactionId.toString();
  });
}

export async function transferToken(
  tokenId: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = await new TransferTransaction()
      .addTokenTransfer(
        TokenId.fromString(tokenId),
        AccountId.fromString(fromAccountId),
        -amount,
      )
      .addTokenTransfer(
        TokenId.fromString(tokenId),
        AccountId.fromString(toAccountId),
        amount,
      )
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Token transfer failed: ${receipt.status.toString()}`);
    }
    return tx.transactionId.toString();
  });
}

export async function transferHbar(
  fromAccountId: string,
  toAccountId: string,
  amountHbar: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tinybars = Math.round(amountHbar * 1e8);
    const tx = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fromAccountId), Hbar.fromTinybars(-tinybars))
      .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(tinybars))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`HBAR transfer failed: ${receipt.status.toString()}`);
    }
    return tx.transactionId.toString();
  });
}

export async function mintNFT(
  tokenId: string,
  metadata: Uint8Array[],
): Promise<{ serialNumbers: number[]; txId: string }> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setMetadata(metadata)
      .execute(client);

    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`NFT mint failed: ${receipt.status.toString()}`);
    }
    return {
      serialNumbers: receipt.serials.map((s) => Number(s)),
      txId: tx.transactionId.toString(),
    };
  });
}

export async function createFungibleToken(params: {
  name: string;
  symbol: string;
  decimals: number;
  supplyType: 'INFINITE' | 'FINITE';
  maxSupply?: number;
  memo?: string;
}): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const operatorId = client.operatorAccountId!;
    const operatorKey = client.operatorPublicKey!;

    let tx: TokenCreateTransaction = new TokenCreateTransaction()
      .setTokenName(params.name)
      .setTokenSymbol(params.symbol)
      .setDecimals(params.decimals)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setAdminKey(operatorKey)
      .setSupplyKey(operatorKey)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(params.supplyType === 'INFINITE' ? TokenSupplyType.Infinite : TokenSupplyType.Finite)
      .setFreezeDefault(false);

    if (params.memo) tx = tx.setTokenMemo(params.memo);
    if (params.supplyType === 'FINITE' && params.maxSupply) {
      tx = tx.setMaxSupply(params.maxSupply);
    }

    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (!receipt.tokenId) throw new Error('Token creation failed: no token ID in receipt');
    return receipt.tokenId.toString();
  });
}

export async function mintFungibleTokens(tokenId: string, amount: number): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setAmount(amount)
      .execute(client);
    const receipt = await tx.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Token mint failed: ${receipt.status.toString()}`);
    }
    return tx.transactionId.toString();
  });
}

export async function ensureTokenAssociated(
  accountId: string,
  tokenId: string,
  accountPrivateKeyHex: string,
): Promise<void> {
  const baseUrl = getMirrorNodeBaseUrl();
  try {
    const r = await axios.get<{ tokens: { token_id: string }[] }>(
      `${baseUrl}/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}&limit=1`,
    );
    if (r.data.tokens && r.data.tokens.length > 0) return;
  } catch {
    // proceed with association if mirror node is unreachable
  }

  return withRetry(async () => {
    const client = getHederaClient();
    const privKey = PrivateKey.fromStringECDSA(accountPrivateKeyHex);
    const tx = await new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds([TokenId.fromString(tokenId)])
      .freezeWith(client)
      .sign(privKey);
    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Token association failed: ${receipt.status.toString()}`);
    }
  });
}

export async function transferTokenFromUser(
  tokenId: string,
  fromAccountId: string,
  fromPrivateKeyHex: string,
  toAccountId: string,
  amountBaseUnits: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const privKey = PrivateKey.fromStringECDSA(fromPrivateKeyHex);
    const tx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromAccountId), -amountBaseUnits)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), amountBaseUnits)
      .freezeWith(client)
      .sign(privKey);
    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Token transfer failed: ${receipt.status.toString()}`);
    }
    return result.transactionId.toString();
  });
}

/**
 * Atomic swap: user sends a token, treasury sends HBAR — one transaction.
 * If treasury has insufficient HBAR the entire tx reverts; user keeps their token.
 */
/**
 * Atomic swap: user sends a token, treasury sends HBAR — one transaction.
 * If treasury has insufficient HBAR the entire tx reverts; user keeps their token.
 */
export async function atomicTokenForHbar(
  tokenId: string,
  userAccountId: string,
  userPrivKeyHex: string,
  treasuryId: string,
  tokenAmountBase: number,
  hbarAmount: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const userPrivKey = PrivateKey.fromStringECDSA(userPrivKeyHex);
    // Round to integer tinybars — Hedera SDK rejects fractional tinybar values
    const tinybars = Math.round(hbarAmount * 1e8);
    const tx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(userAccountId), -tokenAmountBase)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(treasuryId), tokenAmountBase)
      .addHbarTransfer(AccountId.fromString(treasuryId), Hbar.fromTinybars(-tinybars))
      .addHbarTransfer(AccountId.fromString(userAccountId), Hbar.fromTinybars(tinybars))
      .freezeWith(client)
      .sign(userPrivKey);
    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Atomic swap failed: ${receipt.status.toString()}`);
    }
    return result.transactionId.toString();
  });
}

/**
 * Atomic swap: user sends HBAR, treasury sends a token — one transaction.
 * Requires the treasury to already hold the token (mint before calling this).
 */
export async function atomicHbarForToken(
  tokenId: string,
  userAccountId: string,
  userPrivKeyHex: string,
  treasuryId: string,
  hbarAmount: number,
  tokenAmountBase: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const userPrivKey = PrivateKey.fromStringECDSA(userPrivKeyHex);
    // Round to integer tinybars — Hedera SDK rejects fractional tinybar values
    const tinybars = Math.round(hbarAmount * 1e8);
    const tx = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(userAccountId), Hbar.fromTinybars(-tinybars))
      .addHbarTransfer(AccountId.fromString(treasuryId), Hbar.fromTinybars(tinybars))
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(treasuryId), -tokenAmountBase)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(userAccountId), tokenAmountBase)
      .freezeWith(client)
      .sign(userPrivKey);
    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Atomic swap failed: ${receipt.status.toString()}`);
    }
    return result.transactionId.toString();
  });
}

/**
 * Atomic swap: user sends token A, treasury sends token B — one transaction.
 * Used for HNET/HEC/HCC ↔ USDC where both sides are HTS tokens.
 */
export async function atomicTokenForToken(
  fromTokenId: string,
  toTokenId: string,
  userAccountId: string,
  userPrivKeyHex: string,
  treasuryId: string,
  fromAmountBase: number,
  toAmountBase: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const userPrivKey = PrivateKey.fromStringECDSA(userPrivKeyHex);
    const tx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(fromTokenId), AccountId.fromString(userAccountId), -fromAmountBase)
      .addTokenTransfer(TokenId.fromString(fromTokenId), AccountId.fromString(treasuryId), fromAmountBase)
      .addTokenTransfer(TokenId.fromString(toTokenId), AccountId.fromString(treasuryId), -toAmountBase)
      .addTokenTransfer(TokenId.fromString(toTokenId), AccountId.fromString(userAccountId), toAmountBase)
      .freezeWith(client)
      .sign(userPrivKey);
    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Atomic token swap failed: ${receipt.status.toString()}`);
    }
    return result.transactionId.toString();
  });
}

export async function transferHbarFromUser(
  fromAccountId: string,
  fromPrivateKeyHex: string,
  toAccountId: string,
  amountHbar: number,
): Promise<string> {
  return withRetry(async () => {
    const client = getHederaClient();
    const privKey = PrivateKey.fromStringECDSA(fromPrivateKeyHex);
    const tinybars = Math.round(amountHbar * 1e8);
    const tx = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fromAccountId), Hbar.fromTinybars(-tinybars))
      .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(tinybars))
      .freezeWith(client)
      .sign(privKey);
    const result = await tx.execute(client);
    const receipt = await result.getReceipt(client);
    if (receipt.status !== Status.Success) {
      throw new Error(`HBAR transfer failed: ${receipt.status.toString()}`);
    }
    return result.transactionId.toString();
  });
}

export async function getHbarBalance(accountId: string): Promise<number> {
  const baseUrl = getMirrorNodeBaseUrl();
  const r = await axios.get<{ balance?: { balance?: number } }>(
    `${baseUrl}/api/v1/accounts/${accountId}`,
  );
  return (r.data.balance?.balance ?? 0) / 1e8;
}

export async function getAccountTokenBalances(accountId: string): Promise<TokenBalance[]> {
  const baseUrl = getMirrorNodeBaseUrl();
  const response = await axios.get<{
    tokens: Array<{ token_id: string; balance: number; decimals: number; symbol?: string }>;
  }>(`${baseUrl}/api/v1/accounts/${accountId}/tokens`);

  return response.data.tokens.map((t) => ({
    tokenId: t.token_id,
    balance: t.balance,
    decimals: t.decimals,
    symbol: t.symbol ?? '',
  }));
}
