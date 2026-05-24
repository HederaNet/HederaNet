'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../../../components/wallet/WalletContext';
import { apiClient } from '../../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  type: string;
  fromAccount: string;
  toAccount: string | null;
  amountHbar: number;
  status: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  SUBSCRIPTION: 'Subscription',
  ENERGY_TRADE: 'Energy Trade',
  STAKE: 'Stake',
  UNSTAKE: 'Unstake',
  REWARD: 'Reward',
  WITHDRAWAL: 'Withdrawal',
  GOVERNANCE: 'Governance',
};

const HBAR_USD = 0.075;

export default function EarningsPage() {
  const { accountId } = useWallet();

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings-detail', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const res = await apiClient.get<{ data: { earnings: Transaction[]; totalHbar: number } }>(
        `/operators/${accountId}/earnings`,
      );
      return res.data.data;
    },
    enabled: !!accountId,
  });

  const { data: txs = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions-all', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await apiClient.get<{ data: Transaction[] }>(`/transactions/${accountId}?limit=50`);
      return res.data.data;
    },
    enabled: !!accountId,
  });

  // Build chart data: group earnings by day
  const chartData = (() => {
    const map = new Map<string, number>();
    (earningsData?.earnings ?? []).forEach((t) => {
      const day = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map.set(day, (map.get(day) ?? 0) + t.amountHbar);
    });
    return Array.from(map.entries()).map(([day, hbar]) => ({ day, hbar })).slice(-14);
  })();

  const totalHbar = earningsData?.totalHbar ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-1">Your revenue from subscriptions, energy trades, and rewards</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-gray-400 mb-1">Total Earned</div>
          <div className="text-3xl font-bold text-gray-900">{totalHbar.toFixed(2)} <span className="text-base text-gray-400">ℏ</span></div>
          <div className="text-xs text-gray-400 mt-1">≈ ${(totalHbar * HBAR_USD).toFixed(2)} USD</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400 mb-1">Transactions</div>
          <div className="text-3xl font-bold text-gray-900">{earningsData?.earnings.length ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">Successful payments received</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400 mb-1">Avg per Transaction</div>
          <div className="text-3xl font-bold text-gray-900">
            {earningsData && earningsData.earnings.length > 0
              ? (totalHbar / earningsData.earnings.length).toFixed(2)
              : '0.00'}
            <span className="text-base text-gray-400"> ℏ</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">Average payment size</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Earnings Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a7a4a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a7a4a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #ede9e0' }}
                formatter={(v: number) => [`${v.toFixed(2)} ℏ`, 'Earned']}
              />
              <Area type="monotone" dataKey="hbar" stroke="#1a7a4a" strokeWidth={2} fill="url(#earningsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction history */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-cream-200">
          <h2 className="font-semibold text-gray-700">Transaction History</h2>
        </div>
        {txLoading ? (
          <div className="divide-y divide-cream-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex justify-between">
                <div className="h-4 bg-cream-200 rounded w-1/3" />
                <div className="h-4 bg-cream-200 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : txs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="divide-y divide-cream-100">
            {txs.map((tx) => {
              const incoming = tx.toAccount === accountId;
              return (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${incoming ? 'bg-green-50' : 'bg-red-50'}`}>
                      {incoming ? '↓' : '↑'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{TYPE_LABELS[tx.type] ?? tx.type}</div>
                      <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${incoming ? 'text-forest-600' : 'text-red-500'}`}>
                      {incoming ? '+' : '-'}{tx.amountHbar.toFixed(2)} ℏ
                    </div>
                    <div className={`text-xs ${tx.status === 'SUCCESS' ? 'text-green-500' : tx.status === 'FAILED' ? 'text-red-400' : 'text-amber-500'}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
