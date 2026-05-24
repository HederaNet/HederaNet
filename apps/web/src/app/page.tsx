import type { Metadata } from 'next';
import { HeroSection } from '../components/landing/HeroSection';
import { NetworkStatsBar } from '../components/landing/NetworkStatsBar';
import { InfrastructureExplainer } from '../components/landing/InfrastructureExplainer';
import { EarningsCalculator } from '../components/landing/EarningsCalculator';
import { OperatorTestimonials } from '../components/landing/OperatorTestimonials';
import { InvestorCTA } from '../components/landing/InvestorCTA';
import { SiteNav } from '../components/ui/SiteNav';
import { SiteFooter } from '../components/ui/SiteFooter';
import type { NetworkStats } from '@hederanet/types';

export const revalidate = 60;

async function getNetworkStats(): Promise<NetworkStats | null> {
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

export default async function HomePage() {
  const stats = await getNetworkStats();

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection stats={stats} />
        <NetworkStatsBar stats={stats} />
        <InfrastructureExplainer />
        <EarningsCalculator />
        <OperatorTestimonials />
        <InvestorCTA />
      </main>
      <SiteFooter />
    </>
  );
}
