'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from './WalletContext';
import { WalletModal } from './WalletModal';
import { ProfileModal } from './ProfileModal';

export function WalletButton() {
  const { user, connected, connecting } = useWallet();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (connected && user) {
    const label = user.name ?? user.email ?? user.hederaAccountId.slice(-8);
    const initial = (user.name ?? user.email ?? '?')[0]!.toUpperCase();
    return (
      <>
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 rounded-xl bg-forest-50 border border-forest-200 px-3 py-2 text-sm font-medium text-forest-700 hover:bg-forest-100 transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-700 text-white text-xs font-bold overflow-hidden flex-shrink-0">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              : initial}
          </span>
          <span className="max-w-[120px] truncate">{label}</span>
        </button>
        {mounted && showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowSignIn(true)}
        disabled={connecting}
        className="btn-primary py-2 text-sm disabled:opacity-50"
      >
        {connecting ? 'Connecting…' : 'Sign In'}
      </button>
      {mounted && showSignIn && createPortal(
        <WalletModal onClose={() => setShowSignIn(false)} />,
        document.body,
      )}
    </>
  );
}
