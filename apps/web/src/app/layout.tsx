import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif', axes: ['opsz'] });

export const metadata: Metadata = {
  title: { default: 'HederaNet — Community-Owned Internet & Energy for Africa', template: '%s | HederaNet' },
  description: 'HederaNet enables African communities to own and operate internet, solar energy, and edge compute — turning members into infrastructure entrepreneurs on Hedera Hashgraph.',
  keywords: ['DePIN', 'Hedera', 'Africa', 'internet', 'solar energy', 'blockchain', 'web3'],
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'HederaNet — Community-Owned Infrastructure for Africa',
    description: 'Own your internet. Own your energy. Earn on-chain.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@hederanet' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="bg-cream-100 text-gray-900 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
