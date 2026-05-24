'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../wallet/WalletContext';
import { apiClient } from '../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  amountHbar: number;
  createdAt: string;
  type: string;
  status: string;
}

export function RevenueChart() {
  const { accountId } = useWallet();

  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['earnings-chart', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await apiClient.get<{ data: { earnings: Transaction[]; totalHbar: number } }>(
        `/operators/${accountId}/earnings`,
      );
      const earnings = res.data.data.earnings ?? [];

      // Group by calendar day (last 30 days)
      const map = new Map<string, number>();
      const cutoff = Date.now() - 30 * 86400_000;
      earnings
        .filter((t) => t.status === 'SUCCESS' && new Date(t.createdAt).getTime() >= cutoff)
        .forEach((t) => {
          const day = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          map.set(day, (map.get(day) ?? 0) + t.amountHbar);
        });

      return Array.from(map.entries())
        .map(([day, hbar]) => ({ day, hbar: parseFloat(hbar.toFixed(4)) }))
        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    },
    enabled: !!accountId,
    refetchInterval: 60_000,
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-700">30-Day Earnings</h2>
        <span className="text-sm text-gray-500">HBAR per day · live</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-forest-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm">No earnings recorded yet</p>
          <p className="text-xs mt-1 text-gray-300">Deploy a hotspot or list energy to start earning</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHbar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a7a4a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1a7a4a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #ede9e0' }}
              formatter={(v: number) => [`${v.toFixed(4)} ℏ`, 'Earnings']}
            />
            <Area type="monotone" dataKey="hbar" stroke="#1a7a4a" strokeWidth={2} fill="url(#colorHbar)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
