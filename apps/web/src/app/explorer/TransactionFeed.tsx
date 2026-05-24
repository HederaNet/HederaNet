'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const HASHSCAN_BASE = 'https://hashscan.io/testnet/transaction';

type SwapDetail = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
};

type Transaction = {
  id: string;
  type: string;
  fromAccount: string;
  toAccount: string | null;
  amountHbar: number;
  txHashHedera: string | null;
  status: string;
  valueUsdc: number;
  swapDetail: SwapDetail | null;
};

type ApiResponse = {
  transactions: Transaction[];
  hbarPriceUsdc: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const TYPE_FILTERS = ['ALL', 'SWAP', 'FAUCET', 'SUBSCRIPTION', 'ENERGY_TRADE', 'STAKE', 'UNSTAKE', 'REWARD'];

const TYPE_COLORS: Record<string, string> = {
  SWAP: 'bg-blue-100 text-blue-700',
  FAUCET: 'bg-green-100 text-green-700',
  SUBSCRIPTION: 'bg-purple-100 text-purple-700',
  ENERGY_TRADE: 'bg-amber-100 text-amber-700',
  STAKE: 'bg-indigo-100 text-indigo-700',
  UNSTAKE: 'bg-orange-100 text-orange-700',
  REWARD: 'bg-emerald-100 text-emerald-700',
  GOVERNANCE: 'bg-pink-100 text-pink-700',
  WITHDRAWAL: 'bg-red-100 text-red-700',
};

function abbrev(accountId: string | null) {
  if (!accountId) return '—';
  const parts = accountId.split('.');
  if (parts.length === 3) return `0.0.${parts[2]!.slice(0, 7)}`;
  return accountId.slice(0, 10);
}

function fmtNum(n: number, dp: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: dp });
}

function txDetails(tx: Transaction): string {
  if (tx.type === 'SWAP' && tx.swapDetail) {
    const d = tx.swapDetail;
    return `${fmtNum(d.fromAmount, 4)} ${d.fromSymbol} → ${fmtNum(d.toAmount, 4)} ${d.toSymbol}`;
  }
  if (tx.type === 'FAUCET') return `Testnet USDC faucet claim`;
  if (tx.type === 'SUBSCRIPTION') return `Hotspot subscription payment`;
  if (tx.type === 'ENERGY_TRADE') return `Peer-to-peer energy trade`;
  if (tx.type === 'STAKE') return `Staked ${fmtNum(tx.amountHbar, 2)} ℏ`;
  if (tx.type === 'UNSTAKE') return `Unstaked ${fmtNum(tx.amountHbar, 2)} ℏ`;
  if (tx.type === 'REWARD') return `Staking reward disbursement`;
  if (tx.type === 'GOVERNANCE') return `Governance vote`;
  if (tx.type === 'WITHDRAWAL') return `Withdrawal`;
  return tx.type;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      title="Copy transaction hash"
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

export function TransactionFeed() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['explorer-txs', typeFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      const res = await fetch(`${API}/transactions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json() as { data: ApiResponse };
      return json.data;
    },
    refetchInterval: 15_000,
  });

  const txs = data?.transactions ?? [];
  const pagination = data?.pagination;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900">On-Chain Transaction Feed</h2>
          <p className="text-gray-600 mt-1">Every transaction settled on Hedera — live, paginated, filterable</p>
        </div>
        {pagination && (
          <span className="text-sm text-gray-500 bg-cream-100 px-3 py-1.5 rounded-full">
            {pagination.total.toLocaleString()} total transactions
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setTypeFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              typeFilter === f
                ? 'bg-forest-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-forest-400 hover:text-forest-700'
            }`}
          >
            {f === 'ALL' ? 'All Types' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Tx Hash</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Details</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">From → To</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Amount (ℏ)</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">USD Value</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <span className="animate-pulse">Loading transactions…</span>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-red-500">
                    Failed to load transactions.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && txs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    No transactions yet — swap tokens or claim from the faucet to see activity here.
                  </td>
                </tr>
              )}
              {txs.map((tx) => (
                <tr key={tx.id} className="hover:bg-cream-50 transition-colors">
                  {/* Hash */}
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {tx.txHashHedera ? (
                      <span className="flex items-center gap-1">
                        <a
                          href={`${HASHSCAN_BASE}/${tx.txHashHedera}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          title={tx.txHashHedera}
                        >
                          {tx.txHashHedera.slice(0, 18)}…
                        </a>
                        <CopyButton text={tx.txHashHedera} />
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Simulated</span>
                    )}
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[tx.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="px-4 py-3 text-gray-700 max-w-[220px] truncate" title={txDetails(tx)}>
                    {txDetails(tx)}
                  </td>

                  {/* From → To */}
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {abbrev(tx.fromAccount)}
                    {tx.toAccount && tx.toAccount !== tx.fromAccount && (
                      <> → {abbrev(tx.toAccount)}</>
                    )}
                  </td>

                  {/* HBAR amount */}
                  <td className="px-4 py-3 text-right font-mono text-gray-800 whitespace-nowrap">
                    {tx.amountHbar > 0 ? `${fmtNum(tx.amountHbar, 4)} ℏ` : '—'}
                  </td>

                  {/* USD value */}
                  <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                    {tx.valueUsdc > 0
                      ? `$${tx.valueUsdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
                      : '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      tx.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : tx.status === 'FAILED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        tx.status === 'SUCCESS' ? 'bg-green-500' : tx.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-cream-200 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-forest-400 transition-colors"
              >
                ← Prev
              </button>
              <span className="font-medium">{pagination.page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-forest-400 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Hashes link to{' '}
        <a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer" className="text-forest-700 font-medium hover:underline">
          HashScan
        </a>{' '}
        for full block detail, timestamps, and fee breakdown · Auto-refreshes every 15 s
      </p>
    </section>
  );
}
