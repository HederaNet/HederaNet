'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { NetworkStats } from '@hederanet/types';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const HBAR_USD = 0.075;

export function ImpactGrowthChart() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['network-stats-impact'],
    queryFn: async () => {
      const res = await axios.get<{ data: NetworkStats }>(`${API}/network/stats`);
      return res.data.data;
    },
    refetchInterval: 60_000,
  });

  const metrics = stats
    ? [
        {
          label: 'Active Hotspots',
          value: stats.totalActiveHotspots.toLocaleString(),
          sub: 'Internet nodes online now',
          color: 'bg-forest-50 border-forest-200',
          valueColor: 'text-forest-700',
          icon: '📡',
        },
        {
          label: 'Community Members',
          value: stats.totalUsers.toLocaleString(),
          sub: 'Registered participants',
          color: 'bg-blue-50 border-blue-200',
          valueColor: 'text-blue-700',
          icon: '👥',
        },
        {
          label: 'Energy Traded Today',
          value: `${stats.energyTradedKwhToday.toFixed(2)} kWh`,
          sub: 'Peer-to-peer solar energy',
          color: 'bg-amber-50 border-amber-200',
          valueColor: 'text-amber-700',
          icon: '☀️',
        },
        {
          label: 'HBAR Settled On-Chain',
          value: `${stats.totalHbarSettled.toFixed(2)} ℏ`,
          sub: `≈ $${(stats.totalHbarSettled * HBAR_USD).toFixed(2)} USD total volume`,
          color: 'bg-purple-50 border-purple-200',
          valueColor: 'text-purple-700',
          icon: '⛓️',
        },
        {
          label: 'Active Subscriptions',
          value: stats.totalSubscriptions.toLocaleString(),
          sub: 'Paying internet subscribers',
          color: 'bg-green-50 border-green-200',
          valueColor: 'text-green-700',
          icon: '📶',
        },
        {
          label: 'Operators',
          value: stats.totalOperators.toLocaleString(),
          sub: 'Infrastructure entrepreneurs',
          color: 'bg-orange-50 border-orange-200',
          valueColor: 'text-orange-700',
          icon: '🏗️',
        },
      ]
    : [];

  return (
    <section>
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Live Network Stats</h2>
      <p className="text-gray-600 mb-8">
        Real-time metrics from the HederaNet protocol — all verified on Hedera Hashgraph
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-28" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className={`stat-card border ${m.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{m.icon}</span>
                <span className={`text-2xl font-bold ${m.valueColor}`}>{m.value}</span>
              </div>
              <div className="text-xs font-semibold text-gray-700">{m.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm">Unable to load network stats. API may be unreachable.</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Stats refreshed every 60 seconds from on-chain data · Recorded at{' '}
        {stats ? new Date(stats.recordedAt).toLocaleTimeString() : '—'}
      </p>
    </section>
  );
}
