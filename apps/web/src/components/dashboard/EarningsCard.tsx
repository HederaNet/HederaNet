'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../wallet/WalletContext';
import { apiClient } from '../../lib/api';
import { useHbarPrice } from '../../hooks/useHbarPrice';

interface Transaction {
  amountHbar: number;
  createdAt: string;
  status: string;
}

function calcGrowth(earnings: Transaction[]): number | null {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const thisMonth = earnings
    .filter((t) => t.status === 'SUCCESS' && new Date(t.createdAt).getTime() >= thisMonthStart)
    .reduce((s, t) => s + t.amountHbar, 0);

  const lastMonth = earnings
    .filter((t) => t.status === 'SUCCESS' && new Date(t.createdAt).getTime() >= lastMonthStart && new Date(t.createdAt).getTime() < thisMonthStart)
    .reduce((s, t) => s + t.amountHbar, 0);

  if (lastMonth === 0) return null;
  return ((thisMonth - lastMonth) / lastMonth) * 100;
}

export function EarningsCard() {
  const { accountId } = useWallet();

  const { data, isLoading } = useQuery({
    queryKey: ['earnings', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const res = await apiClient.get<{ data: { totalHbar: number; earnings: Transaction[] } }>(
        `/operators/${accountId}/earnings`,
      );
      return res.data.data;
    },
    enabled: !!accountId,
    refetchInterval: 30_000,
  });

  const hbarPrice = useHbarPrice();
  const totalHbar = data?.totalHbar ?? 0;
  const totalUsd = totalHbar * hbarPrice;
  const growth = data ? calcGrowth(data.earnings ?? []) : null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Total Earnings</h2>
        <span className="badge-active">Live</span>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-cream-200 rounded w-1/2" />
          <div className="h-4 bg-cream-200 rounded w-1/3" />
        </div>
      ) : (
        <>
          <div className="text-4xl font-bold text-gray-900">
            {totalHbar.toFixed(4)} <span className="text-xl text-gray-500">ℏ</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">≈ ${totalUsd.toFixed(2)} USD</div>
          {growth !== null && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={growth >= 0 ? 'text-forest-600' : 'text-red-500'}>
                {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
              </span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
