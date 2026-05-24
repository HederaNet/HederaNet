'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '../../../components/wallet/WalletContext';
import { apiClient } from '../../../lib/api';
import type { Hotspot } from '@hederanet/types';
import { Modal } from '../../../components/ui/Modal';
import { LocationPicker } from '../../../components/ui/LocationPicker';
import { OperatorRegistrationCard } from '../../../components/ui/OperatorRegistrationCard';

interface LocValue { lat: number; lng: number; label: string; }

export default function HotspotsPage() {
  const { accountId, user } = useWallet();
  const isOperator = user?.role === 'OPERATOR' || user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployLoc, setDeployLoc] = useState<LocValue | null>(null);
  const [deployRadius, setDeployRadius] = useState('500');
  const [deployPrice, setDeployPrice] = useState('5');
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployError, setDeployError] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [managingId, setManagingId] = useState<string | null>(null);

  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['operator-hotspots', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await apiClient.get<{ data: Hotspot[] }>(`/operators/${accountId}/hotspots`);
      return res.data.data;
    },
    enabled: !!accountId,
    refetchInterval: 30_000,
  });

  const online = hotspots.filter((h) => h.isActive).length;

  async function handleDeploy(e: React.FormEvent) {
    e.preventDefault();
    if (!deployLoc) { setDeployError('Please select a location'); return; }
    setDeployError('');
    setDeployLoading(true);
    try {
      await apiClient.post('/hotspots', {
        lat: deployLoc.lat,
        lng: deployLoc.lng,
        coverageRadiusMeters: parseFloat(deployRadius),
        monthlyPriceHbar: parseFloat(deployPrice),
      });
      await queryClient.invalidateQueries({ queryKey: ['operator-hotspots', accountId] });
      setShowDeployModal(false);
      setDeployLoc(null);
      setDeployRadius('500');
      setDeployPrice('5');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to deploy hotspot';
      setDeployError(msg);
    } finally {
      setDeployLoading(false);
    }
  }

  async function handleToggleActive(h: Hotspot) {
    setManagingId(h.id);
    try {
      await apiClient.put(`/hotspots/${h.id}`, { isActive: !h.isActive });
      await queryClient.invalidateQueries({ queryKey: ['operator-hotspots', accountId] });
    } catch {
      // ignore
    } finally {
      setManagingId(null);
    }
  }

  function openDeployModal() {
    setDeployError('');
    setDeployLoc(null);
    setShowDeployModal(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">My Hotspots</h1>
          <p className="text-sm text-gray-500 mt-1">{online} of {hotspots.length} online</p>
        </div>
        {isOperator && (
          <button className="btn-primary py-2 text-sm" onClick={openDeployModal}>+ Deploy Hotspot</button>
        )}
      </div>

      {!isOperator && <OperatorRegistrationCard />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse h-36" />
          ))}
        </div>
      ) : hotspots.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📡</div>
          <h2 className="font-semibold text-gray-700 mb-2">No hotspots yet</h2>
          <p className="text-sm text-gray-500 mb-6">Deploy your first hotspot to start earning HBAR from network subscribers.</p>
          <button className="btn-primary py-2 text-sm mx-auto" onClick={openDeployModal}>Deploy First Hotspot</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotspots.map((h) => (
            <div key={h.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${h.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                  <span className="font-semibold text-gray-900 text-sm">Node {h.id.slice(-6).toUpperCase()}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {h.isActive ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Uptime (30d)</div>
                  <div className="font-semibold text-gray-800">{h.uptimePct30d.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Monthly Price</div>
                  <div className="font-semibold text-gray-800">{h.monthlyPriceHbar} ℏ</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Coverage</div>
                  <div className="font-semibold text-gray-800">{h.coverageRadiusMeters}m radius</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Location</div>
                  <div className="font-semibold text-gray-800 truncate">{h.lat.toFixed(3)}, {h.lng.toFixed(3)}</div>
                </div>
              </div>

              {expandedId === h.id && (
                <div className="mt-3 pt-3 border-t border-cream-100 space-y-1.5 text-xs text-gray-600">
                  <div><span className="text-gray-400">HCS Topic ID: </span>{h.hcsTopicId}</div>
                  <div><span className="text-gray-400">Installed at: </span>{new Date(h.installedAt).toLocaleDateString()}</div>
                  <a
                    href={`https://hashscan.io/testnet/topic/${h.hcsTopicId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-forest-600 hover:underline"
                  >
                    View on HashScan →
                  </a>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-cream-100 flex gap-2">
                <button
                  className="flex-1 text-xs py-1.5 rounded-lg border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                >
                  {expandedId === h.id ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  className="flex-1 text-xs py-1.5 rounded-lg border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors disabled:opacity-50"
                  disabled={managingId === h.id}
                  onClick={() => handleToggleActive(h)}
                >
                  {managingId === h.id ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Working...
                    </span>
                  ) : h.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeployModal && (
        <Modal title="Deploy Hotspot" onClose={() => setShowDeployModal(false)}>
          <form onSubmit={handleDeploy} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <LocationPicker
                value={deployLoc}
                onChange={setDeployLoc}
                placeholder="Search city, e.g. Lagos, Nigeria"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coverage Radius (m)</label>
              <input
                type="number"
                min="1"
                required
                value={deployRadius}
                onChange={(e) => setDeployRadius(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Price (ℏ)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={deployPrice}
                onChange={(e) => setDeployPrice(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
              />
            </div>
            {deployError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{deployError}</p>}
            <button type="submit" disabled={deployLoading || !deployLoc} className="btn-primary w-full disabled:opacity-50">
              {deployLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Deploy Hotspot
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
