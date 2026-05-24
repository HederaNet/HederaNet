'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../wallet/WalletContext';
import { SiteNav } from '../ui/SiteNav';
import { DashboardNav } from './DashboardNav';
import { WalletModal } from '../wallet/WalletModal';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { connected, loading } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen pt-16 flex items-center justify-center bg-cream-100">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <span className="w-6 h-6 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        </div>
      </>
    );
  }

  if (!connected) {
    return (
      <>
        <SiteNav />
        <div className="min-h-screen pt-16 flex items-center justify-center bg-cream-100">
          <div className="card max-w-md w-full mx-6 text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Sign in to continue</h1>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to access the operator dashboard. A Hedera testnet account is automatically created for you.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary w-full">
              Sign In / Create Account
            </button>
          </div>
          {showModal && createPortal(
            <WalletModal onClose={() => setShowModal(false)} />,
            document.body,
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <div className="min-h-screen pt-16 bg-cream-100">
        <DashboardNav />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </>
  );
}
