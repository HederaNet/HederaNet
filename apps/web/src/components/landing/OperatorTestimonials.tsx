'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

interface Operator {
  id: string;
  hederaAccountId: string;
  city: string;
  country: string;
  tier: string;
  reputationScore: number;
  stakedHbar: number;
  _count: { hotspots: number; solarInstallations: number };
}

const TIER_STYLES: Record<string, { badge: string; label: string }> = {
  GOLD: { badge: 'badge-gold', label: 'Gold' },
  SILVER: { badge: 'badge-silver', label: 'Silver' },
  BRONZE: { badge: 'badge-bronze', label: 'Bronze' },
};

function AccountAvatar({ id }: { id: string }) {
  const initials = id.replace('0.0.', '').slice(-3);
  const hue = parseInt(id.replace(/\D/g, '').slice(-4)) % 360;
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: `hsl(${hue}, 55%, 42%)` }}
    >
      {initials}
    </div>
  );
}

export function OperatorTestimonials() {
  const { data: operators = [], isLoading } = useQuery({
    queryKey: ['top-operators'],
    queryFn: async () => {
      const res = await axios.get<{ data: Operator[] }>(`${API}/operators?limit=3`);
      return res.data.data;
    },
    staleTime: 120_000,
  });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">Top Operators on the Network</h2>
          <p className="text-lg text-gray-600">Ranked by on-chain reputation score</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-48" />)}
          </div>
        ) : operators.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏗️</div>
            <p className="font-semibold text-gray-600 mb-2">No operators yet</p>
            <p className="text-sm mb-6">Be the first to register and earn from HederaNet infrastructure.</p>
            <Link href="/dashboard" className="btn-primary py-2 text-sm">Become an Operator</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {operators.map((op, i) => {
              const tierStyle = TIER_STYLES[op.tier] ?? TIER_STYLES['BRONZE'];
              return (
                <div key={op.id} className="card border border-cream-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <AccountAvatar id={op.hederaAccountId} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-gray-400 truncate">{op.hederaAccountId}</div>
                      <div className="font-semibold text-gray-900 mt-0.5">{op.city}, {op.country}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={tierStyle.badge}>{tierStyle.label}</span>
                        {i === 0 && <span className="text-xs text-amber-600 font-semibold">#1 Operator</span>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-cream-50 p-2">
                      <div className="text-lg font-bold text-gray-900">{op._count.hotspots}</div>
                      <div className="text-xs text-gray-400">Hotspots</div>
                    </div>
                    <div className="rounded-xl bg-cream-50 p-2">
                      <div className="text-lg font-bold text-gray-900">{op._count.solarInstallations}</div>
                      <div className="text-xs text-gray-400">Solar</div>
                    </div>
                    <div className="rounded-xl bg-cream-50 p-2">
                      <div className="text-lg font-bold text-forest-700">{op.reputationScore}</div>
                      <div className="text-xs text-gray-400">Rep Score</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between text-xs text-gray-400">
                    <span>{op.stakedHbar.toFixed(2)} ℏ staked</span>
                    <a
                      href={`https://hashscan.io/testnet/account/${op.hederaAccountId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      HashScan ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
