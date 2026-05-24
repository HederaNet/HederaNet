'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '../../../components/wallet/WalletContext';
import { apiClient } from '../../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketToken {
  symbol: string;
  name: string;
  tokenId: string | null;
  decimals: number;
  priceUsdc: number;
  logoEmoji: string;
  isActive: boolean;
}

interface PortfolioEntry {
  symbol: string;
  name: string;
  logoEmoji: string;
  balance: number;
  priceUsdc: number;
  valueUsdc: number;
}

interface PortfolioData {
  portfolio: PortfolioEntry[];
  totalUsdc: number;
}

interface SwapResult {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  hederaTxId: string | null;
  simulated: boolean;
  errorMsg: string | null;
}

interface SwapRecord {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  status: string;
  createdAt: string;
  simulated?: boolean;
}

interface FaucetEligibility {
  eligible: boolean;
  nextClaimAt: string | null;
  amountUsdc: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 4): string {
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

function fmtUsdc(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function timeUntil(isoDate: string): string {
  const ms = new Date(isoDate).getTime() - Date.now();
  if (ms <= 0) return 'now';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Portfolio Bar ────────────────────────────────────────────────────────────

function PortfolioBar({ portfolio }: { portfolio: PortfolioEntry[] }) {
  const total = portfolio.reduce((s, p) => s + p.valueUsdc, 0);
  if (total === 0) return null;
  const colors: Record<string, string> = {
    HBAR: 'bg-purple-500',
    HNET: 'bg-forest-600',
    HEC: 'bg-yellow-500',
    HCC: 'bg-blue-500',
    USDC: 'bg-green-400',
  };
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full gap-px">
      {portfolio.filter((p) => p.valueUsdc > 0).map((p) => (
        <div
          key={p.symbol}
          className={`${colors[p.symbol] ?? 'bg-gray-400'} transition-all`}
          style={{ width: `${(p.valueUsdc / total) * 100}%` }}
          title={`${p.symbol}: $${fmtUsdc(p.valueUsdc)}`}
        />
      ))}
    </div>
  );
}

// ─── Price Ticker ─────────────────────────────────────────────────────────────

function PriceTicker({ tokens }: { tokens: MarketToken[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {tokens.map((t) => (
        <div key={t.symbol} className="flex-shrink-0 card py-3 px-4 min-w-[110px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">{t.logoEmoji}</span>
            <span className="text-xs font-semibold text-gray-700">{t.symbol}</span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            ${t.priceUsdc < 0.01
              ? t.priceUsdc.toFixed(6)
              : t.priceUsdc < 1
              ? t.priceUsdc.toFixed(4)
              : t.priceUsdc.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{t.name}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const { accountId } = useWallet();
  const queryClient = useQueryClient();

  // Swap state
  const [fromSymbol, setFromSymbol] = useState('HNET');
  const [toSymbol, setToSymbol] = useState('USDC');
  const [fromInput, setFromInput] = useState('');
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState<SwapResult | null>(null);

  // Faucet state
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMsg, setFaucetMsg] = useState('');
  const [faucetError, setFaucetError] = useState('');

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: tokens = [] } = useQuery({
    queryKey: ['market-tokens'],
    queryFn: async () => {
      const r = await apiClient.get<{ data: MarketToken[] }>('/market/tokens');
      return r.data.data;
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ['market-portfolio', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const r = await apiClient.get<{ data: PortfolioData }>('/market/portfolio');
      return r.data.data;
    },
    enabled: !!accountId,
    refetchInterval: 30_000,
  });

  const { data: faucetEligibility, refetch: refetchEligibility } = useQuery({
    queryKey: ['faucet-eligibility', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const r = await apiClient.get<{ data: FaucetEligibility }>('/market/faucet/eligibility');
      return r.data.data;
    },
    enabled: !!accountId,
    refetchInterval: 60_000,
  });

  const { data: swapHistory = [] } = useQuery({
    queryKey: ['market-swaps', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const r = await apiClient.get<{ data: SwapRecord[] }>('/market/swaps?limit=10');
      return r.data.data;
    },
    enabled: !!accountId,
    refetchInterval: 30_000,
  });

  // ── Computed values ──────────────────────────────────────────────────────────

  const fromToken = tokens.find((t) => t.symbol === fromSymbol);
  const toToken = tokens.find((t) => t.symbol === toSymbol);
  const fromAmount = parseFloat(fromInput) || 0;
  const toAmount =
    fromToken && toToken && fromAmount > 0
      ? (fromAmount * fromToken.priceUsdc) / toToken.priceUsdc
      : 0;

  const fromValueUsdc = fromToken ? fromAmount * fromToken.priceUsdc : 0;
  const rate =
    fromToken && toToken
      ? `1 ${fromSymbol} = ${fmt(fromToken.priceUsdc / toToken.priceUsdc)} ${toSymbol}`
      : '';

  // ── Swap mutation ────────────────────────────────────────────────────────────

  const swapMutation = useMutation({
    mutationFn: async () => {
      const r = await apiClient.post<{ data: SwapResult }>('/market/swap', {
        fromSymbol,
        toSymbol,
        fromAmount,
      });
      return r.data.data;
    },
    onSuccess: (data) => {
      setSwapSuccess(data);
      setFromInput('');
      setSwapError('');
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['market-portfolio', accountId] }),
        queryClient.invalidateQueries({ queryKey: ['market-swaps', accountId] }),
      ]);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Swap failed';
      setSwapError(msg);
    },
  });

  function handleSwap(e: React.FormEvent) {
    e.preventDefault();
    setSwapError('');
    setSwapSuccess(null);
    if (!fromAmount || fromAmount <= 0) { setSwapError('Enter an amount'); return; }
    if (fromSymbol === toSymbol) { setSwapError('Select different tokens'); return; }
    swapMutation.mutate();
  }

  function flipTokens() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
    setFromInput(toAmount > 0 ? fmt(toAmount, 6) : '');
    setSwapError('');
    setSwapSuccess(null);
  }

  // ── Faucet ───────────────────────────────────────────────────────────────────

  async function handleFaucet() {
    setFaucetError('');
    setFaucetMsg('');
    setFaucetLoading(true);
    try {
      const r = await apiClient.post<{ data: { amountUsdc: number; simulated: boolean } }>(
        '/market/faucet',
      );
      const { amountUsdc, simulated } = r.data.data;
      setFaucetMsg(
        simulated
          ? `${amountUsdc} USDC credited to your account`
          : `${amountUsdc} USDC sent to your Hedera wallet on testnet!`,
      );
      await Promise.all([
        refetchEligibility(),
        queryClient.invalidateQueries({ queryKey: ['market-portfolio', accountId] }),
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Faucet unavailable';
      setFaucetError(msg);
    } finally {
      setFaucetLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Token Market</h1>
        <p className="text-sm text-gray-500 mt-1">
          Swap HBAR, HNET, HEC, and HCC for USDC 
        </p>
      </div>

      {/* Price ticker */}
      {tokens.length > 0 && <PriceTicker tokens={tokens} />}

      {/* Portfolio overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Portfolio</h2>
          {portfolioData && (
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                ${fmtUsdc(portfolioData.totalUsdc)}
              </div>
              <div className="text-xs text-gray-400">total value in USDC</div>
            </div>
          )}
        </div>

        {portfolioLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-cream-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : portfolioData ? (
          <>
            <PortfolioBar portfolio={portfolioData.portfolio} />
            <div className="mt-4 space-y-2">
              {portfolioData.portfolio.map((p) => (
                <div
                  key={p.symbol}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{p.logoEmoji}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.symbol}</div>
                      <div className="text-xs text-gray-400">{p.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {fmt(p.balance, 4)} {p.symbol}
                    </div>
                    <div className="text-xs text-gray-400">≈ ${fmtUsdc(p.valueUsdc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            Connect your wallet to see your portfolio
          </div>
        )}
      </div>

      {/* Swap panel */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Swap Tokens</h2>
        <form onSubmit={handleSwap} className="space-y-3">
          {/* From */}
          <div className="rounded-xl border border-cream-200 bg-cream-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">You Pay</label>
              {fromAmount > 0 && (
                <span className="text-xs text-gray-400">≈ ${fmtUsdc(fromValueUsdc)}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={fromSymbol}
                onChange={(e) => { setFromSymbol(e.target.value); setSwapSuccess(null); setSwapError(''); }}
                className="text-sm font-semibold text-gray-900 bg-white border border-cream-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                {tokens.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.logoEmoji} {t.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={fromInput}
                onChange={(e) => { setFromInput(e.target.value); setSwapSuccess(null); setSwapError(''); }}
                className="flex-1 text-xl font-bold text-gray-900 bg-transparent focus:outline-none text-right placeholder-gray-300"
              />
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={flipTokens}
              className="w-9 h-9 rounded-full border border-cream-200 bg-white hover:bg-cream-50 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900"
              title="Flip tokens"
            >
              ⇅
            </button>
          </div>

          {/* To */}
          <div className="rounded-xl border border-cream-200 bg-cream-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">You Receive</label>
              {toAmount > 0 && (
                <span className="text-xs text-gray-400">
                  ≈ ${fmtUsdc(toAmount * (toToken?.priceUsdc ?? 1))}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={toSymbol}
                onChange={(e) => { setToSymbol(e.target.value); setSwapSuccess(null); setSwapError(''); }}
                className="text-sm font-semibold text-gray-900 bg-white border border-cream-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                {tokens.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.logoEmoji} {t.symbol}
                  </option>
                ))}
              </select>
              <div className="flex-1 text-xl font-bold text-gray-400 text-right">
                {toAmount > 0 ? fmt(toAmount, 6) : '0'}
              </div>
            </div>
          </div>

          {/* Rate */}
          {rate && fromToken && (
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>{rate}</span>
              <span>Price: ${fromToken.priceUsdc < 0.01 ? fromToken.priceUsdc.toFixed(6) : fromToken.priceUsdc.toFixed(4)} USDC</span>
            </div>
          )}

          {swapError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{swapError}</p>
          )}
          {swapSuccess && swapSuccess.status === 'FAILED' && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <div className="font-medium">Swap failed — no funds were moved</div>
              {swapSuccess.errorMsg && (
                <div className="text-xs mt-1 font-mono opacity-80">{swapSuccess.errorMsg}</div>
              )}
            </div>
          )}
          {swapSuccess && swapSuccess.status !== 'FAILED' && (
            <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <div className="font-medium">
                Swapped {fmt(swapSuccess.fromAmount)} {swapSuccess.fromSymbol} →{' '}
                {fmt(swapSuccess.toAmount, 6)} {swapSuccess.toSymbol}
              </div>
              {swapSuccess.hederaTxId ? (
                <div className="text-xs mt-1 font-mono text-green-600 truncate">
                  Tx: {swapSuccess.hederaTxId}
                </div>
              ) : (
                <div className="text-xs text-green-600 mt-1">
                  Swap recorded — balances will reflect on next portfolio refresh
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={swapMutation.isPending || !fromInput || parseFloat(fromInput) <= 0}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
          >
            {swapMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Swapping...
              </span>
            ) : (
              `Swap ${fromSymbol} → ${toSymbol}`
            )}
          </button>
        </form>
      </div>

      {/* Faucet */}
      <div className="card border-blue-200 bg-blue-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 mb-1">🚰 Testnet USDC Faucet</h2>
            <p className="text-sm text-gray-600">
              Claim free USDC to test swaps and trades. {faucetEligibility?.amountUsdc ?? 100} USDC
              per day.
            </p>
            {faucetError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">{faucetError}</p>
            )}
            {faucetMsg && (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">{faucetMsg}</p>
            )}
            {faucetEligibility && !faucetEligibility.eligible && faucetEligibility.nextClaimAt && (
              <p className="text-xs text-gray-500 mt-2">
                Next claim in: <span className="font-medium">{timeUntil(faucetEligibility.nextClaimAt)}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleFaucet}
            disabled={faucetLoading || (faucetEligibility?.eligible === false)}
            className="flex-shrink-0 py-2 px-4 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {faucetLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Claiming...
              </span>
            ) : (
              'Claim USDC'
            )}
          </button>
        </div>
      </div>

      {/* Swap history */}
      {swapHistory.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-cream-200">
            <h2 className="font-semibold text-gray-700">Recent Swaps</h2>
          </div>
          <div className="divide-y divide-cream-100">
            {swapHistory.map((swap) => (
              <div key={swap.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-sm flex-shrink-0">
                    💱
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {swap.fromSymbol} → {swap.toSymbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(swap.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {fmt(swap.fromAmount)} {swap.fromSymbol}
                  </div>
                  <div className="text-xs text-green-600">
                    → {fmt(swap.toAmount, 6)} {swap.toSymbol}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      swap.status === 'SUCCESS'
                        ? 'text-green-500'
                        : swap.status === 'FAILED'
                        ? 'text-red-400'
                        : 'text-amber-500'
                    }`}
                  >
                    {swap.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
