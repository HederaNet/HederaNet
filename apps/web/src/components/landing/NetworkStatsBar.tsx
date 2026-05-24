import type { NetworkStats } from '@hederanet/types';

const HBAR_USD = 0.075;

interface Props { stats: NetworkStats | null; }

const PLACEHOLDER: NetworkStats = {
  totalActiveHotspots: 0,
  totalUsers: 0,
  totalOperators: 0,
  energyTradedKwhToday: 0,
  totalHbarSettled: 0,
  totalSubscriptions: 0,
  recordedAt: new Date().toISOString(),
};

export function NetworkStatsBar({ stats }: Props) {
  const s = stats ?? PLACEHOLDER;
  const volumeUsd = s.totalHbarSettled * HBAR_USD;
  const items = [
    { label: 'Active Hotspots', value: s.totalActiveHotspots.toLocaleString() },
    { label: 'Community Members', value: s.totalUsers.toLocaleString() },
    { label: 'Energy Traded Today', value: `${s.energyTradedKwhToday.toFixed(1)} kWh` },
    { label: 'HBAR Settled', value: `${s.totalHbarSettled.toFixed(2)} ℏ` },
    { label: 'Total Volume', value: `$${volumeUsd.toFixed(2)}` },
    { label: 'Operators', value: s.totalOperators.toLocaleString() },
  ];

  return (
    <section className="bg-forest-700 text-white py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 divide-x divide-white/20">
          {items.map((item) => (
            <div key={item.label} className="pl-6 first:pl-0">
              <div className="text-2xl font-bold text-amber-400">{item.value}</div>
              <div className="text-xs text-white/60 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
