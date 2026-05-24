'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../wallet/WalletContext';
import { apiClient } from '../../lib/api';
import type { Hotspot } from '@hederanet/types';

export function LiveNodesCard() {
  const { accountId } = useWallet();

  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['operator-hotspots', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await apiClient.get<{ data: Hotspot[] }>(`/operators/${accountId}/hotspots`);
      return res.data.data;
    },
    enabled: !!accountId,
    refetchInterval: 15_000,
  });

  const online = hotspots.filter((h) => h.isActive).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Live Nodes</h2>
        <span className="text-sm text-gray-500">{online}/{hotspots.length} online</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-cream-200 rounded animate-pulse" />
          ))}
        </div>
      ) : hotspots.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-3xl mb-2">📡</div>
          <div className="text-sm">No hotspots deployed yet</div>
        </div>
      ) : (
        <div className="space-y-2">
          {hotspots.slice(0, 5).map((h) => (
            <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-cream-100">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${h.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-gray-900">Node {h.id.slice(-4)}</span>
              </div>
              <div className="text-xs text-gray-500">{h.uptimePct30d.toFixed(1)}% uptime</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
