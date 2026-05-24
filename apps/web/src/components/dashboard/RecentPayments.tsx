'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../wallet/WalletContext';
import { apiClient } from '../../lib/api';
import { useHbarPrice } from '../../hooks/useHbarPrice';
import type { Transaction } from '@hederanet/types';

const TYPE_LABELS: Record<string, string> = {
  SUBSCRIPTION: '📶 Subscription',
  ENERGY_TRADE: '⚡ Energy Trade',
  STAKE: '🔒 Stake',
  REWARD: '🎁 Reward',
  WITHDRAWAL: '💸 Withdrawal',
};

export function RecentPayments() {
  const { accountId } = useWallet();
  const hbarPrice = useHbarPrice();

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['transactions', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await apiClient.get<{ data: Transaction[] }>(`/transactions/${accountId}?limit=10`);
      return res.data.data;
    },
    enabled: !!accountId,
  });

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-700 mb-4">Recent Payments</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-cream-200 rounded animate-pulse" />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No transactions yet</div>
      ) : (
        <div className="divide-y divide-cream-200">
          {txs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{TYPE_LABELS[tx.type] ?? tx.type}</div>
                <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${tx.toAccount ? 'text-forest-600' : 'text-red-500'}`}>
                  {tx.toAccount ? '+' : '-'}{tx.amountHbar.toFixed(2)} ℏ
                </div>
                {tx.amountHbar > 0 && (
                  <div className="text-xs text-gray-400">≈ ${(tx.amountHbar * hbarPrice).toFixed(2)}</div>
                )}
                <div className={`text-xs ${tx.status === 'SUCCESS' ? 'text-green-500' : tx.status === 'FAILED' ? 'text-red-400' : 'text-amber-500'}`}>
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
