'use client';

import Link from 'next/link';
import { useState } from 'react';
import { WalletButton } from '../wallet/WalletButton';

const links = [
  { href: '/map', label: 'Network Map' },
  { href: '/explore', label: 'Market' },
  { href: '/explorer', label: 'Explorer' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/governance', label: 'Governance' },
  { href: '/staking', label: 'Staking' },
  { href: '/swap', label: 'Swap' },
  { href: 'https://docs.hederanet.online', label: 'Docs', external: true },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif font-bold text-xl text-forest-700">
          <img src="/logo.svg" alt="HederaNet" className="w-8 h-8 flex-shrink-0" />
          HederaNet
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) =>
            'external' in l && l.external ? (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-700 hover:text-forest-700 transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-forest-700 transition-colors">
                {l.label}
              </Link>
            )
          )}
          <WalletButton />
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-cream-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-gray-700 mb-1" />
          <div className="w-5 h-0.5 bg-gray-700 mb-1" />
          <div className="w-5 h-0.5 bg-gray-700" />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-cream-200 p-4 space-y-2">
          {links.map((l) =>
            'external' in l && l.external ? (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="block py-2 text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            )
          )}
          <div className="pt-2">
            <WalletButton />
          </div>
        </div>
      )}
    </nav>
  );
}
