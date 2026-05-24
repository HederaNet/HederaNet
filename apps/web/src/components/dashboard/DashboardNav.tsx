'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/hotspots', label: 'Hotspots', icon: '📡' },
  { href: '/dashboard/energy', label: 'Energy', icon: '☀️' },
  { href: '/dashboard/earnings', label: 'Earnings', icon: '💰' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-cream-200 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                pathname === tab.href
                  ? 'border-forest-700 text-forest-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon} {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
