import type { Metadata } from 'next';
import { SiteNav } from '../../components/ui/SiteNav';
import { SiteFooter } from '../../components/ui/SiteFooter';
import { ExploreContent } from './ExploreContent';

export const metadata: Metadata = {
  title: 'Explore Services',
  description: 'Find and subscribe to HederaNet internet hotspots, solar energy listings, and compute services near you.',
};

export default function ExplorePage() {
  return (
    <>
      <SiteNav />
      <main className="pt-16 min-h-screen bg-cream-100">
        <div className="bg-forest-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="font-serif text-3xl font-bold mb-2">Explore Services</h1>
            <p className="text-white/70">Find internet, energy, and compute services in your area</p>
          </div>
        </div>
        <ExploreContent />
      </main>
      <SiteFooter />
    </>
  );
}
