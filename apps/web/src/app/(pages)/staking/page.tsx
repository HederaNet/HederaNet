'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '../../../components/wallet/WalletContext';
import { apiClient } from '../../../lib/api';
import { useHbarPrice } from '../../../hooks/useHbarPrice';
import { Modal } from '../../../components/ui/Modal';
import { OperatorRegistrationCard } from '../../../components/ui/OperatorRegistrationCard';

const MIRROR_NODE = process.env['NEXT_PUBLIC_MIRROR_NODE'] ?? 'https://testnet.mirrornode.hedera.com';

const TIER_THRESHOLDS = [
  { tier: 'GOLD', min: 500, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { tier: 'SILVER', min: 100, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  { tier: 'BRONZE', min: 0, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
];

export default function StakingPage() {
  const { accountId, user } = useWallet();
  const queryClient = useQueryClient();

  const [stakeInput, setStakeInput] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);
  const [stakeError, setStakeError] = useState('');
  const [stakeSuccess, setStakeSuccess] = useState('');

  const [showUnstakeModal, setShowUnstakeModal] = useState(false);
  const [unstakeInput, setUnstakeInput] = useState('');
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [unstakeError, setUnstakeError] = useState('');

  // Fetch HBAR balance from Hedera mirror node
  const { data: balance, refetch: refetchBalance } = useQuery({
    queryKey: ['hbar-balance', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const r = await fetch(`${MIRROR_NODE}/api/v1/accounts/${accountId}`);
      const d = await r.json() as { balance?: { balance?: number } };
      return (d.balance?.balance ?? 0) / 100_000_000;
    },
    enabled: !!accountId,
    refetchInterval: 60_000,
  });

  // Fetch USDC balance from portfolio API
  const { data: usdcBalance, refetch: refetchUsdc } = useQuery({
    queryKey: ['usdc-balance', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const r = await apiClient.get<{ data: { portfolio: { symbol: string; balance: number }[] } }>('/market/portfolio');
      const usdc = r.data.data.portfolio.find((p) => p.symbol === 'USDC');
      return usdc?.balance ?? 0;
    },
    enabled: !!accountId,
    refetchInterval: 60_000,
  });

  const hbarPrice = useHbarPrice();
  const isOperator = user?.role === 'OPERATOR' || user?.role === 'ADMIN';

  async function handleStake(e: React.FormEvent) {
    e.preventDefault();
    setStakeError('');
    setStakeSuccess('');
    const amount = parseFloat(stakeInput);
    if (isNaN(amount) || amount <= 0) {
      setStakeError('Enter a valid amount greater than 0');
      return;
    }
    if (balance !== null && balance !== undefined && amount > balance) {
      setStakeError('Amount exceeds available balance');
      return;
    }
    setStakeLoading(true);
    try {
      await apiClient.post('/operators/stake', { amount });
      setStakeSuccess(`Successfully staked ${amount} ℏ`);
      setStakeInput('');
      await Promise.all([
        refetchBalance(),
        refetchUsdc(),
        queryClient.invalidateQueries({ queryKey: ['operator-staking', accountId] }),
      ]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to stake';
      setStakeError(msg);
    } finally {
      setStakeLoading(false);
    }
  }

  function openUnstakeModal() {
    setUnstakeInput('');
    setUnstakeError('');
    setShowUnstakeModal(true);
  }

  async function handleUnstake(e: React.FormEvent) {
    e.preventDefault();
    setUnstakeError('');
    const amount = parseFloat(unstakeInput);
    if (isNaN(amount) || amount <= 0) {
      setUnstakeError('Enter a valid amount greater than 0');
      return;
    }
    setUnstakeLoading(true);
    try {
      await apiClient.post('/operators/unstake', { amount });
      await Promise.all([
        refetchBalance(),
        refetchUsdc(),
        queryClient.invalidateQueries({ queryKey: ['operator-staking', accountId] }),
      ]);
      setShowUnstakeModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to unstake';
      setUnstakeError(msg);
    } finally {
      setUnstakeLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Staking</h1>
        <p className="text-sm text-gray-500 mt-1">Stake HNET tokens to become an operator and earn higher rewards</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-gray-400 mb-1">HBAR Balance</div>
          <div className="text-3xl font-bold text-gray-900">
            {balance !== null && balance !== undefined ? balance.toFixed(4) : '—'}
            <span className="text-base text-gray-400"> ℏ</span>
          </div>
          {balance != null && (
            <div className="text-xs text-gray-400 mt-0.5">≈ ${(balance * hbarPrice).toFixed(2)} USD</div>
          )}
          <div className="text-xs text-gray-400 mt-1">Available to stake</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400 mb-1">USDC Balance</div>
          <div className="text-3xl font-bold text-gray-900">
            {usdcBalance !== null && usdcBalance !== undefined
              ? `$${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">Testnet USDC · claim via Market</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400 mb-1">Your Status</div>
          <div className="text-lg font-bold text-gray-900 mt-1">{user?.role ?? '—'}</div>
          <div className="text-xs text-gray-400 mt-1">KYC: {user?.kycStatus ?? '—'}</div>
        </div>
      </div>

      {/* Tier benefits */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Operator Tiers</h2>
        <div className="space-y-3">
          {TIER_THRESHOLDS.map(({ tier, min, color, bg }) => (
            <div key={tier} className={`flex items-center justify-between p-4 rounded-xl border ${bg}`}>
              <div>
                <div className={`font-bold text-sm ${color}`}>{tier}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Min stake: {min} ℏ{min > 0 ? ` ≈ $${(min * hbarPrice).toFixed(0)}` : ''}
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                {tier === 'GOLD' && <span>2× reward multiplier</span>}
                {tier === 'SILVER' && <span>1.5× reward multiplier</span>}
                {tier === 'BRONZE' && <span>1× base rewards</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staking actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Stake HBAR</h2>
        {!isOperator ? (
          <OperatorRegistrationCard />
        ) : (
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount to Stake (ℏ)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0"
                  value={stakeInput}
                  onChange={(e) => { setStakeInput(e.target.value); setStakeError(''); setStakeSuccess(''); }}
                  className="flex-1 rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                />
                <button type="submit" disabled={stakeLoading} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
                  {stakeLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  Stake
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Staking locks your HBAR to maintain your operator tier.</p>
            </div>
            {stakeError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{stakeError}</p>}
            {stakeSuccess && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{stakeSuccess}</p>}
          </form>
        )}
      </div>

      {/* Unstake */}
      {isOperator && (
        <div className="card border-orange-200 bg-orange-50">
          <h2 className="font-semibold text-gray-700 mb-2">Unstake</h2>
          <p className="text-sm text-gray-500 mb-4">Unstaking reduces your tier and may affect your reputation score.</p>
          <button
            className="py-2 px-4 text-sm rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-100 transition-colors"
            onClick={openUnstakeModal}
          >
            Unstake Tokens
          </button>
        </div>
      )}

      {showUnstakeModal && (
        <Modal title="Unstake Tokens" onClose={() => setShowUnstakeModal(false)}>
          <form onSubmit={handleUnstake} className="space-y-4">
            <p className="text-sm text-gray-500">Enter amount to unstake. This may reduce your tier.</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (ℏ)</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={unstakeInput}
                onChange={(e) => setUnstakeInput(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                placeholder="e.g. 50"
              />
            </div>
            {unstakeError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{unstakeError}</p>}
            <button type="submit" disabled={unstakeLoading} className="btn-primary w-full disabled:opacity-50">
              {unstakeLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Confirm Unstake
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
