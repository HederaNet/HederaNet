'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useHbarPrice } from '../../hooks/useHbarPrice';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const PAGE_SIZE = 10;

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

const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  GOLD: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  SILVER: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
  BRONZE: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
};

function AccountAvatar({ id, size = 'md' }: { id: string; size?: 'md' | 'lg' }) {
  const initials = id.replace('0.0.', '').slice(-3);
  const hue = parseInt(id.replace(/\D/g, '').slice(-4)) % 360;
  const cls = size === 'lg' ? 'w-16 h-16 text-lg' : 'w-12 h-12 text-sm';
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: `hsl(${hue}, 55%, 42%)` }}
    >
      {initials}
    </div>
  );
}

export function CaseStudies() {
  const [page, setPage] = useState(1);
  const hbarPrice = useHbarPrice();

  const { data: allOperators = [], isLoading } = useQuery({
    queryKey: ['operator-case-studies'],
    queryFn: async () => {
      const res = await axios.get<{ data: Operator[] }>(`${API}/operators?limit=100`);
      return res.data.data;
    },
    staleTime: 120_000,
  });

  const totalPages = Math.ceil(allOperators.length / PAGE_SIZE);
  const operators = allOperators.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section>
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Operator Profiles</h2>
      <p className="text-gray-600 mb-8">All metrics are verified on-chain and sourced directly from the Hedera network.</p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-40" />)}
        </div>
      ) : operators.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🌍</div>
          <h3 className="font-semibold text-gray-700 mb-2">No operators registered yet</h3>
          <p className="text-sm text-gray-500">Operator profiles will appear here as the network grows on the Hedera testnet.</p>
        </div>
      ) : (
        <>
        <div className="space-y-6">
          {operators.map((op) => {
            const tc = TIER_COLORS[op.tier] ?? TIER_COLORS['BRONZE'];
            return (
              <div key={op.id} className="card grid md:grid-cols-3 gap-6 items-start">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <AccountAvatar id={op.hederaAccountId} size="lg" />
                    <div>
                      <div className="font-bold text-lg text-gray-900">{op.city}</div>
                      <div className="text-sm text-gray-500">{op.country}</div>
                      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-semibold border ${tc.bg} ${tc.border} ${tc.text}`}>
                        {op.tier}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-400 break-all">{op.hederaAccountId}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card bg-forest-50 border-forest-200">
                    <div className="text-2xl font-bold text-forest-700">{op._count.hotspots}</div>
                    <div className="text-xs text-gray-500">Hotspots</div>
                  </div>
                  <div className="stat-card bg-amber-50 border-amber-200">
                    <div className="text-2xl font-bold text-amber-700">{op._count.solarInstallations}</div>
                    <div className="text-xs text-gray-500">Solar Panels</div>
                  </div>
                  <div className="stat-card bg-blue-50 border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{op.reputationScore}</div>
                    <div className="text-xs text-gray-500">Rep Score</div>
                  </div>
                  <div className="stat-card bg-purple-50 border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">{op.stakedHbar.toFixed(0)} ℏ</div>
                    <div className="text-xs text-gray-400">≈ ${(op.stakedHbar * hbarPrice).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Staked</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3">Verified On-Chain</div>
                  <a
                    href={`https://hashscan.io/testnet/account/${op.hederaAccountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mb-3"
                  >
                    View account on HashScan ↗
                  </a>
                  <div className="p-3 bg-cream-100 rounded-xl">
                    <div className="text-xs text-gray-500">
                      All hotspot deployments and energy trades are cryptographically signed and immutable on Hedera Hashgraph.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allOperators.length)} of {allOperators.length} operators
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-forest-400 transition-colors"
              >
                ← Prev
              </button>
              <span className="font-medium">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-forest-400 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
        </>
      )}
    </section>
  );
}
