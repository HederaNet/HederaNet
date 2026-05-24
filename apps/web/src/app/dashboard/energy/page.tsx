'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '../../../components/wallet/WalletContext';
import { apiClient } from '../../../lib/api';
import { Modal } from '../../../components/ui/Modal';
import { LocationPicker } from '../../../components/ui/LocationPicker';
import { OperatorRegistrationCard } from '../../../components/ui/OperatorRegistrationCard';

interface SolarLoc { lat: number; lng: number; label: string; }

interface EnergyListing {
  id: string;
  pricePerKwhHbar: number;
  availableUnits: number;
  isActive: boolean;
  createdAt: string;
  installation: {
    capacityKw: number;
    city?: string;
    operator: { tier: string; city: string; reputationScore: number };
  };
}

export default function EnergyPage() {
  const { user } = useWallet();
  const isOperator = user?.role === 'OPERATOR' || user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  // List Energy modal state
  const [showListModal, setShowListModal] = useState(false);
  const [listStep, setListStep] = useState<1 | 2>(1);
  const [installationId, setInstallationId] = useState('');
  const [solarCapacity, setSolarCapacity] = useState('');
  const [solarLoc, setSolarLoc] = useState<SolarLoc | null>(null);
  const [listPrice, setListPrice] = useState('');
  const [listUnits, setListUnits] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');

  // Buy modal state
  const [buyListing, setBuyListing] = useState<EnergyListing | null>(null);
  const [buyUnits, setBuyUnits] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['energy-listings'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EnergyListing[] }>('/energy/listings?limit=20');
      return res.data.data;
    },
    refetchInterval: 60_000,
  });

  function openListModal() {
    setListStep(1);
    setSolarCapacity('');
    setSolarLoc(null);
    setListPrice('');
    setListUnits('');
    setListError('');
    setInstallationId('');
    setShowListModal(true);
  }

  async function handleSolarInstallation(e: React.FormEvent) {
    e.preventDefault();
    if (!solarLoc) { setListError('Please select a location'); return; }
    setListError('');
    setListLoading(true);
    try {
      const res = await apiClient.post<{ data: { id: string } }>('/energy/solar-installation', {
        capacityKw: parseFloat(solarCapacity),
        lat: solarLoc.lat,
        lng: solarLoc.lng,
      });
      setInstallationId(res.data.data.id);
      setListStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to register installation';
      setListError(msg);
    } finally {
      setListLoading(false);
    }
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    setListError('');
    setListLoading(true);
    try {
      await apiClient.post('/energy/listings', {
        installationId,
        pricePerKwhHbar: parseFloat(listPrice),
        availableUnits: parseFloat(listUnits),
      });
      await queryClient.invalidateQueries({ queryKey: ['energy-listings'] });
      setShowListModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create listing';
      setListError(msg);
    } finally {
      setListLoading(false);
    }
  }

  function openBuyModal(listing: EnergyListing) {
    setBuyListing(listing);
    setBuyUnits('');
    setBuyError('');
  }

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (!buyListing) return;
    setBuyError('');
    setBuyLoading(true);
    try {
      await apiClient.post('/energy/trade', {
        listingId: buyListing.id,
        units: parseFloat(buyUnits),
      });
      await queryClient.invalidateQueries({ queryKey: ['energy-listings'] });
      setBuyListing(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to complete trade';
      setBuyError(msg);
    } finally {
      setBuyLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Energy Market</h1>
          <p className="text-sm text-gray-500 mt-1">Buy and sell solar energy on the Hedera network</p>
        </div>
        {isOperator && (
          <button className="btn-primary py-2 text-sm" onClick={openListModal}>+ List Energy</button>
        )}
      </div>

      {!isOperator && <OperatorRegistrationCard />}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Listings', value: listings.filter((l) => l.isActive).length.toString(), icon: '⚡' },
          { label: 'Total Available', value: `${listings.reduce((s, l) => s + l.availableUnits, 0).toFixed(1)} kWh`, icon: '☀️' },
          { label: 'Avg Price', value: listings.length ? `${(listings.reduce((s, l) => s + l.pricePerKwhHbar, 0) / listings.length).toFixed(3)} ℏ/kWh` : '—', icon: '💱' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <div className="text-xs text-gray-400">{stat.label}</div>
              <div className="font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-cream-200">
          <h2 className="font-semibold text-gray-700">Available Listings</h2>
        </div>

        {isLoading ? (
          <div className="divide-y divide-cream-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                <div className="h-4 bg-cream-200 rounded w-1/4" />
                <div className="h-4 bg-cream-200 rounded w-1/4" />
                <div className="h-4 bg-cream-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">☀️</div>
            <div className="text-sm">No energy listings yet</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Capacity</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Available</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Price / kWh</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Tier</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{l.installation.operator.city}</td>
                    <td className="px-6 py-4 text-gray-600">{l.installation.capacityKw} kW</td>
                    <td className="px-6 py-4 text-gray-600">{l.availableUnits.toFixed(1)} kWh</td>
                    <td className="px-6 py-4 font-semibold text-forest-700">{l.pricePerKwhHbar} ℏ</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-cream-100 text-gray-600 font-medium">
                        {l.installation.operator.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-xs text-forest-600 hover:underline font-medium"
                        onClick={() => openBuyModal(l)}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* List Energy Modal — Step 1: Solar Installation */}
      {showListModal && listStep === 1 && (
        <Modal title="Register Solar Installation" onClose={() => setShowListModal(false)}>
          <form onSubmit={handleSolarInstallation} className="space-y-4">
            <p className="text-xs text-gray-500">Step 1 of 2 — Register your solar installation before listing energy.</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Capacity (kW)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={solarCapacity}
                onChange={(e) => setSolarCapacity(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <LocationPicker
                value={solarLoc}
                onChange={setSolarLoc}
                placeholder="Search city, e.g. Nairobi, Kenya"
              />
            </div>
            {listError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{listError}</p>}
            <button type="submit" disabled={listLoading || !solarLoc} className="btn-primary w-full disabled:opacity-50">
              {listLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Next: Create Listing
            </button>
          </form>
        </Modal>
      )}

      {/* List Energy Modal — Step 2: Create Listing */}
      {showListModal && listStep === 2 && (
        <Modal title="Create Energy Listing" onClose={() => setShowListModal(false)}>
          <form onSubmit={handleCreateListing} className="space-y-4">
            <p className="text-xs text-gray-500">Step 2 of 2 — Set your price and available units.</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price per kWh (ℏ)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                placeholder="e.g. 0.05"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Available Units (kWh)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={listUnits}
                onChange={(e) => setListUnits(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                placeholder="e.g. 100"
              />
            </div>
            {listError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{listError}</p>}
            <button type="submit" disabled={listLoading} className="btn-primary w-full disabled:opacity-50">
              {listLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Create Listing
            </button>
          </form>
        </Modal>
      )}

      {/* Buy Modal */}
      {buyListing && (
        <Modal title="Buy Energy" onClose={() => setBuyListing(null)}>
          <form onSubmit={handleBuy} className="space-y-4">
            <div className="rounded-xl bg-cream-50 border border-cream-200 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span className="font-medium text-gray-800">{buyListing.installation.operator.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span className="font-medium text-gray-800">{buyListing.pricePerKwhHbar} ℏ / kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available</span>
                <span className="font-medium text-gray-800">{buyListing.availableUnits.toFixed(1)} kWh</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Units (kWh)</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={buyUnits}
                onChange={(e) => setBuyUnits(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                placeholder="e.g. 10"
              />
            </div>
            {buyUnits && !isNaN(parseFloat(buyUnits)) && (
              <p className="text-xs text-gray-500">
                Total: <span className="font-semibold text-gray-800">{(parseFloat(buyUnits) * buyListing.pricePerKwhHbar).toFixed(4)} ℏ</span>
              </p>
            )}
            {buyError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{buyError}</p>}
            <button type="submit" disabled={buyLoading} className="btn-primary w-full disabled:opacity-50">
              {buyLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Confirm Purchase
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
