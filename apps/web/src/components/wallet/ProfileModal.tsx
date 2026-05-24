'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useWallet } from './WalletContext';
import { apiClient } from '../../lib/api';

interface Props { onClose: () => void }

const MIRROR_NODE = 'https://testnet.mirrornode.hedera.com';
const EXPLORER = 'https://hashscan.io/testnet/account';
const AVATAR_MAX_BYTES = 220_000; // ~165KB image → ~220KB base64

function Badge({ label, variant }: { label: string; variant: 'green' | 'amber' | 'red' | 'gray' | 'blue' }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[variant]}`}>
      {label}
    </span>
  );
}

function kycVariant(status: string): 'green' | 'amber' | 'red' {
  if (status === 'APPROVED') return 'green';
  if (status === 'REJECTED') return 'red';
  return 'amber';
}

function Avatar({ src, initial, size = 'md', onClick }: { src: string | null; initial: string; size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  const sizes = { sm: 'h-6 w-6 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-16 w-16 text-2xl' };
  const cls = `${sizes[size]} flex-shrink-0 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center overflow-hidden`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cls} ${onClick ? 'hover:opacity-80 transition-opacity cursor-pointer ring-2 ring-transparent hover:ring-forest-400' : 'cursor-default'}`}
      title={onClick ? 'Change profile picture' : undefined}
    >
      {src ? (
        <img src={src} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </button>
  );
}

export function ProfileModal({ onClose }: Props) {
  const { user, updateUser, disconnect } = useWallet();
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [usdcLoading, setUsdcLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarData, setAvatarData] = useState<string | null | undefined>(undefined); // undefined = not changed
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  // Fetch HBAR balance from Hedera mirror node
  useEffect(() => {
    if (!user?.hederaAccountId) { setBalanceLoading(false); return; }
    fetch(`${MIRROR_NODE}/api/v1/accounts/${user.hederaAccountId}`)
      .then((r) => r.json())
      .then((data: { balance?: { balance?: number } }) => {
        setBalance((data.balance?.balance ?? 0) / 100_000_000);
      })
      .catch(() => setBalance(null))
      .finally(() => setBalanceLoading(false));
  }, [user?.hederaAccountId]);

  // Fetch USDC balance from portfolio API
  useEffect(() => {
    if (!user?.hederaAccountId) { setUsdcLoading(false); return; }
    apiClient
      .get<{ data: { portfolio: { symbol: string; balance: number }[] } }>('/market/portfolio')
      .then((res) => {
        const usdc = res.data.data.portfolio.find((p) => p.symbol === 'USDC');
        setUsdcBalance(usdc?.balance ?? 0);
      })
      .catch(() => setUsdcBalance(null))
      .finally(() => setUsdcLoading(false));
  }, [user?.hederaAccountId]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    setAvatarError('');
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError(`Image is too large (max ${Math.round(AVATAR_MAX_BYTES / 1024)}KB)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setAvatarData(dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    (e.target as HTMLInputElement).value = '';
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarData(null);
    setAvatarError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (newPassword && !/[A-Za-z]/.test(newPassword)) { setError('New password must contain at least one letter'); return; }
    if (newPassword && !/[0-9]/.test(newPassword)) { setError('New password must contain at least one number'); return; }

    setSaving(true);
    try {
      const body: Record<string, string | null> = {};
      if (name.trim() !== (user?.name ?? '')) body['name'] = name.trim();
      if (email.trim().toLowerCase() !== (user?.email ?? '')) body['email'] = email.trim().toLowerCase();
      if (avatarData !== undefined) body['avatarUrl'] = avatarData; // null = remove
      if (newPassword) { body['newPassword'] = newPassword; body['currentPassword'] = currentPassword; }

      if (Object.keys(body).length === 0) { setEditing(false); return; }

      const res = await apiClient.patch<{ data: { name: string | null; email: string | null; avatarUrl: string | null } }>('/auth/me', body);
      updateUser({ name: res.data.data.name, email: res.data.data.email, avatarUrl: res.data.data.avatarUrl });
      setSuccess('Profile updated');
      setCurrentPassword('');
      setNewPassword('');
      setAvatarData(undefined);
      setEditing(false);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? 'Update failed'
        : 'Update failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
    setAvatarError('');
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setAvatarPreview(user?.avatarUrl ?? null);
    setAvatarData(undefined);
    setCurrentPassword('');
    setNewPassword('');
  };

  if (!user) return null;

  const initial = (user.name ?? user.email ?? '?')[0]!.toUpperCase();
  const displayName = user.name ?? user.email ?? 'Anonymous';

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-full items-center justify-center p-4 py-8">
        <div className="relative card w-full max-w-md animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold">{editing ? 'Edit Profile' : 'My Profile'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {!editing ? (
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar src={user.avatarUrl ?? null} initial={initial} size="lg" />
                <div>
                  <div className="font-semibold text-gray-900 text-lg leading-tight">{displayName}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge label={user.role} variant="blue" />
                    <Badge label={`KYC: ${user.kycStatus}`} variant={kycVariant(user.kycStatus)} />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-0 mb-6 border border-cream-200 rounded-xl overflow-hidden divide-y divide-cream-200">
                {user.email && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wide flex-shrink-0">Email</span>
                    <span className="text-sm text-gray-800 text-right break-all">{user.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wide flex-shrink-0">Account ID</span>
                  <a
                    href={`${EXPLORER}/${user.hederaAccountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-forest-600 hover:text-forest-700 hover:underline text-right break-all"
                  >
                    {user.hederaAccountId} ↗
                  </a>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wide flex-shrink-0">HBAR Balance</span>
                  {balanceLoading ? (
                    <span className="h-4 w-20 bg-cream-200 rounded animate-pulse inline-block" />
                  ) : balance !== null ? (
                    <span className="text-sm font-semibold text-gray-900">{balance.toFixed(4)} ℏ</span>
                  ) : (
                    <span className="text-sm text-gray-400">Unavailable</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wide flex-shrink-0">USDC Balance</span>
                  {usdcLoading ? (
                    <span className="h-4 w-20 bg-cream-200 rounded animate-pulse inline-block" />
                  ) : usdcBalance !== null ? (
                    <span className="text-sm font-semibold text-gray-900">
                      ${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Unavailable</span>
                  )}
                </div>
                {user.hederaPublicKey && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wide flex-shrink-0">Public Key</span>
                    <span className="text-xs text-gray-500 font-mono text-right break-all">
                      {user.hederaPublicKey.slice(0, 16)}…{user.hederaPublicKey.slice(-6)}
                    </span>
                  </div>
                )}
              </div>

              {success && (
                <p className="text-sm text-forest-600 bg-forest-50 rounded-lg px-3 py-2 mb-4">{success}</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setEditing(true); setSuccess(''); }} className="btn-primary flex-1 py-2 text-sm">
                  Edit Profile
                </button>
                <button
                  onClick={() => { disconnect(); onClose(); }}
                  className="flex-1 py-2 text-sm rounded-xl border-2 border-cream-200 text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => { void handleSave(e); }} className="space-y-4" noValidate>

              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-2 pb-4 border-b border-cream-100">
                <div className="relative">
                  <Avatar src={avatarPreview} initial={initial} size="lg" onClick={handleAvatarClick} />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-forest-700 text-white text-xs pointer-events-none">
                    ✎
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleAvatarClick} className="text-xs text-forest-600 hover:underline">
                    Upload photo
                  </button>
                  {avatarPreview && (
                    <button type="button" onClick={removeAvatar} className="text-xs text-gray-400 hover:text-red-500">
                      Remove
                    </button>
                  )}
                </div>
                {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
                <p className="text-xs text-gray-400">JPG, PNG, GIF · max {Math.round(AVATAR_MAX_BYTES / 1024)}KB</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName((e.target as HTMLInputElement).value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                />
              </div>

              <div className="border-t border-cream-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-3">Change Password <span className="font-normal text-gray-400">(optional)</span></p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                      placeholder="Min 8 chars, letters + numbers"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={cancelEdit} className="flex-1 py-2 text-sm rounded-xl border-2 border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
