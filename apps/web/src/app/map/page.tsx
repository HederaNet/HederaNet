import type { Metadata } from 'next';
import { SiteNav } from '../../components/ui/SiteNav';
import { NetworkMap } from '../../components/map/NetworkMap';

export const metadata: Metadata = {
  title: 'Network Map',
  description: 'Live map of HederaNet infrastructure across Africa — internet hotspots, solar installations, and compute nodes.',
};

export default function MapPage() {
  return (
    <>
      <SiteNav />
      <div className="h-screen pt-16 flex flex-col">
        <NetworkMap />
      </div>
    </>
  );
}
