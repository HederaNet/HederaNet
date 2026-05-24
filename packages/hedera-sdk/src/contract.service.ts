import {
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractId,
  Hbar,
  ContractFunctionParameters,
  Status,
} from '@hashgraph/sdk';
import type { ContractCallResult } from '@hederanet/types';
import { getHederaClient, withRetry } from './hedera.service.js';

export async function callContract(
  contractId: string,
  functionName: string,
  params: ContractFunctionParameters,
  gasLimit = 300_000,
  payableAmountHbar = 0,
): Promise<ContractCallResult> {
  return withRetry(async () => {
    const client = getHederaClient();
    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(contractId))
      .setGas(gasLimit)
      .setFunction(functionName, params);

    if (payableAmountHbar > 0) {
      tx.setPayableAmount(new Hbar(payableAmountHbar));
    }

    const submitted = await tx.execute(client);
    const receipt = await submitted.getReceipt(client);

    if (receipt.status !== Status.Success) {
      return {
        txId: submitted.transactionId.toString(),
        status: 'FAILED',
        error: `Contract call failed: ${receipt.status.toString()}`,
      };
    }

    const record = await submitted.getRecord(client);
    return {
      txId: submitted.transactionId.toString(),
      status: 'SUCCESS',
      result: record.contractFunctionResult,
    };
  });
}

export async function queryContract(
  contractId: string,
  functionName: string,
  params: ContractFunctionParameters,
  gasLimit = 100_000,
): Promise<unknown> {
  return withRetry(async () => {
    const client = getHederaClient();
    const query = new ContractCallQuery()
      .setContractId(ContractId.fromString(contractId))
      .setGas(gasLimit)
      .setFunction(functionName, params);

    const result = await query.execute(client);
    return result;
  });
}

// ─── Energy Trading Contract ──────────────────────────────────────────────────

export async function contractCreateEnergyListing(
  contractId: string,
  amount: number,
  pricePerKwh: number,
  durationSeconds: number,
  qualityProof: Uint8Array,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters()
    .addUint256(amount)
    .addUint256(pricePerKwh)
    .addUint256(durationSeconds)
    .addBytes32(qualityProof);

  return callContract(contractId, 'createListing', params, 400_000);
}

export async function contractPurchaseEnergy(
  contractId: string,
  listingId: Uint8Array,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters().addBytes32(listingId);
  return callContract(contractId, 'purchaseEnergy', params, 400_000);
}

// ─── Governance Contract ──────────────────────────────────────────────────────

export async function contractCreateProposal(
  contractId: string,
  title: string,
  description: string,
  votingPeriodSeconds: number,
  quorum: number,
  threshold: number,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addUint256(votingPeriodSeconds)
    .addUint256(quorum)
    .addUint256(threshold);

  return callContract(contractId, 'createProposal', params, 500_000);
}

export async function contractCastVote(
  contractId: string,
  proposalId: Uint8Array,
  choice: number,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters()
    .addBytes32(proposalId)
    .addUint8(choice);

  return callContract(contractId, 'castVote', params, 300_000);
}

// ─── Service Payment Contract ─────────────────────────────────────────────────

export async function contractRegisterHotspot(
  contractId: string,
  lat: number,
  lng: number,
  priceHbar: number,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters()
    .addInt256(Math.round(lat * 1e6))
    .addInt256(Math.round(lng * 1e6))
    .addUint256(Math.round(priceHbar * 1e8));

  return callContract(contractId, 'registerHotspot', params, 400_000);
}

export async function contractSubscribeToHotspot(
  contractId: string,
  hotspotId: string,
  amountHbar: number,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters().addString(hotspotId);
  return callContract(contractId, 'subscribe', params, 400_000, amountHbar);
}

// ─── Operator Staking Contract ────────────────────────────────────────────────

export async function contractStake(
  contractId: string,
  amountHbar: number,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters();
  return callContract(contractId, 'stake', params, 300_000, amountHbar);
}

export async function contractUnstake(
  contractId: string,
  amountHbar: number,
): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters().addUint256(Math.round(amountHbar * 1e8));
  return callContract(contractId, 'unstake', params, 300_000);
}

export async function contractClaimRewards(contractId: string): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters();
  return callContract(contractId, 'claimRewards', params, 300_000);
}

export async function contractWithdrawEarnings(contractId: string): Promise<ContractCallResult> {
  const params = new ContractFunctionParameters();
  return callContract(contractId, 'withdrawEarnings', params, 300_000);
}
