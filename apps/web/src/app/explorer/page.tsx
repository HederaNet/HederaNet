import type { Metadata } from 'next';
import { SiteNav } from '../../components/ui/SiteNav';
import { SiteFooter } from '../../components/ui/SiteFooter';
import { ImpactMetricsGrid } from '../impact/ImpactMetricsGrid';
import { ImpactGrowthChart } from '../impact/ImpactGrowthChart';
import { CaseStudies } from '../impact/CaseStudies';
import { OnChainProof } from '../impact/OnChainProof';
import { TransactionFeed } from './TransactionFeed';
import type { NetworkStats } from '@hederanet/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Explorer',
  description: 'Live on-chain explorer for HederaNet — browse every transaction, operator profile, and network metric verified on Hedera Hashgraph.',
};

async function getStats(): Promise<NetworkStats | null> {
  try {
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/network/stats`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: NetworkStats };
    return data.data ?? null;
  } catch {
    return null;
  }
}

export default async function ExplorerPage() {
  const stats = await getStats();

  return (
    <>
      <SiteNav />
      <main className="pt-16">
        {/* Header */}
        <section className="bg-forest-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm mb-6">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Live On-Chain Data — Updated Every 60 Seconds
            </div>
            <h1 className="font-serif text-5xl font-bold mb-4">HederaNet Explorer</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Every metric, transaction, and operator record here is verifiable on Hedera Hashgraph.

            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
          <ImpactMetricsGrid stats={stats} />
          <ImpactGrowthChart />
          <TransactionFeed />
          <CaseStudies />
          <OnChainProof />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
