'use client';

import { EarningsCard } from '../../components/dashboard/EarningsCard';
import { LiveNodesCard } from '../../components/dashboard/LiveNodesCard';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { RecentPayments } from '../../components/dashboard/RecentPayments';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EarningsCard />
        <LiveNodesCard />
      </div>
      <RevenueChart />
      <RecentPayments />
    </div>
  );
}
