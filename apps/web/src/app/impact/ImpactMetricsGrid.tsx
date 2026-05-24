import type { NetworkStats } from '@hederanet/types';

interface Props { stats: NetworkStats | null; }

export function ImpactMetricsGrid({ stats }: Props) {
  const metrics = [
    { label: 'Active Hotspot Nodes', value: stats?.totalActiveHotspots ?? 0, unit: '', icon: '📡', color: 'border-blue-500', description: 'Mesh internet nodes operated by community members' },
    { label: 'Community Wallets', value: stats?.totalUsers ?? 0, unit: '', icon: '👥', color: 'border-forest-500', description: 'Individual Hedera accounts actively using the network' },
    { label: 'Energy Traded Today', value: stats?.energyTradedKwhToday?.toFixed(1) ?? '0', unit: ' kWh', icon: '⚡', color: 'border-amber-500', description: 'Peer-to-peer solar energy sold on-chain today' },
    { label: 'HBAR Settled', value: stats?.totalHbarSettled?.toFixed(2) ?? '0', unit: ' ℏ', icon: '💰', color: 'border-purple-500', description: 'Total on-chain payments processed to date' },
    { label: 'Active Subscriptions', value: stats?.totalSubscriptions ?? 0, unit: '', icon: '📶', color: 'border-green-500', description: 'Live internet subscriptions held by community' },
    { label: 'Operators', value: stats?.totalOperators ?? 0, unit: '', icon: '🏗️', color: 'border-orange-500', description: 'Registered infrastructure entrepreneurs' },
  ];

  return (
    <section>
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">Live Network Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className={`card border-l-4 ${m.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{m.icon}</span>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                  <span className="text-xl text-gray-500">{m.unit}</span>
                </div>
                <div className="font-semibold text-gray-700 mt-1">{m.label}</div>
                <div className="text-xs text-gray-500 mt-1">{m.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
