'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useWallet } from '../../components/wallet/WalletContext';
import { apiClient } from '../../lib/api';
import { useHbarPrice } from '../../hooks/useHbarPrice';
import type { Hotspot, EnergyListing } from '@hederanet/types';
import { Modal } from '../../components/ui/Modal';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export function ExploreContent() {
  const { connected, accountId } = useWallet();
  const queryClient = useQueryClient();
  const hbarPrice = useHbarPrice();
  const [tab, setTab] = useState<'internet' | 'energy'>('internet');

  // Subscribe modal state
  const [subHotspot, setSubHotspot] = useState<Hotspot | null>(null);
  const [subDays, setSubDays] = useState('30');
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState('');

  // Buy energy modal state
  const [buyListing, setBuyListing] = useState<EnergyListing | null>(null);
  const [buyUnits, setBuyUnits] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState('');

  const { data: hotspots = [], isLoading: loadingHotspots } = useQuery({
    queryKey: ['explore-hotspots'],
    queryFn: async () => {
      const res = await axios.get<{ data: Hotspot[] }>(`${API}/hotspots?lat=0&lng=20&radiusKm=5000&limit=50`);
      return res.data.data;
    },
  });

  const { data: listings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['explore-energy'],
    queryFn: async () => {
      const res = await axios.get<{ data: EnergyListing[] }>(`${API}/energy/listings`);
      return res.data.data;
    },
  });

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subHotspot) return;
    setSubError('');
    setSubSuccess('');
    setSubLoading(true);
    try {
      await apiClient.post('/subscriptions', {
        hotspotId: subHotspot.id,
        durationDays: parseInt(subDays, 10),
      });
      setSubSuccess(`Subscribed for ${subDays} days! ${(subHotspot.monthlyPriceHbar * parseInt(subDays, 10) / 30).toFixed(2)} ℏ charged.`);
      await queryClient.invalidateQueries({ queryKey: ['explore-hotspots'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to subscribe';
      setSubError(msg);
    } finally {
      setSubLoading(false);
    }
  }

  async function handleBuyEnergy(e: React.FormEvent) {
    e.preventDefault();
    if (!buyListing) return;
    setBuyError('');
    setBuySuccess('');
    setBuyLoading(true);
    try {
      await apiClient.post('/energy/trade', {
        listingId: buyListing.id,
        units: parseFloat(buyUnits),
      });
      const total = (parseFloat(buyUnits) * buyListing.pricePerKwhHbar).toFixed(4);
      setBuySuccess(`Purchased ${buyUnits} kWh for ${total} ℏ!`);
      await queryClient.invalidateQueries({ queryKey: ['explore-energy'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Purchase failed';
      setBuyError(msg);
    } finally {
      setBuyLoading(false);
    }
  }

  function openSubscribe(h: Hotspot) {
    if (!connected) { alert('Please sign in to subscribe.'); return; }
    setSubHotspot(h);
    setSubDays('30');
    setSubError('');
    setSubSuccess('');
  }

  function openBuy(l: EnergyListing) {
    if (!connected) { alert('Please sign in to purchase energy.'); return; }
    setBuyListing(l);
    setBuyUnits('');
    setBuyError('');
    setBuySuccess('');
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab('internet')}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${tab === 'internet' ? 'bg-forest-700 text-white' : 'bg-white text-gray-700 hover:bg-cream-100'}`}
        >
          📡 Internet Hotspots ({hotspots.length})
        </button>
        <button
          onClick={() => setTab('energy')}
          className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${tab === 'energy' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-cream-100'}`}
        >
          ☀️ Energy Listings ({listings.length})
        </button>
      </div>

      {tab === 'internet' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingHotspots ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-48" />
            ))
          ) : hotspots.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <div className="text-4xl mb-2">📡</div>
              <div>No hotspots available yet</div>
            </div>
          ) : (
            hotspots.map((h) => (
              <div key={h.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${h.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm font-semibold text-gray-900">{h.isActive ? 'Active' : 'Offline'}</span>
                  <span className="ml-auto text-xs text-gray-400">{h.uptimePct30d.toFixed(1)}% uptime</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {h.monthlyPriceHbar} <span className="text-lg text-gray-500">ℏ/month</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">≈ ${(h.monthlyPriceHbar * hbarPrice).toFixed(2)}/mo</div>
                <div className="text-sm text-gray-500 mb-1">{h.coverageRadiusMeters}m coverage radius</div>
                <div className="text-xs text-gray-400 font-mono mb-4">Node {h.id.slice(-8)}</div>
                <button
                  className="btn-primary w-full py-2 text-sm"
                  onClick={() => openSubscribe(h)}
                  disabled={!h.isActive}
                >
                  {h.isActive ? 'Subscribe' : 'Node Offline'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'energy' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingListings ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-48" />
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <div className="text-4xl mb-2">☀️</div>
              <div>No energy listings available yet</div>
            </div>
          ) : (
            listings.map((l) => (
              <div key={l.id} className="card hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                  {l.pricePerKwhHbar} <span className="text-lg text-gray-500">ℏ/kWh</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">≈ ${(l.pricePerKwhHbar * hbarPrice).toFixed(4)}/kWh</div>
                <div className="text-sm text-gray-500 mb-1">{l.availableUnits.toFixed(2)} kWh available</div>
                {l.installation?.operator?.city && (
                  <div className="text-xs text-gray-400 mb-1">{l.installation.operator.city}</div>
                )}
                {l.installation?.capacityKw && (
                  <div className="text-xs text-gray-400 mb-4">{l.installation.capacityKw} kW installation</div>
                )}
                <button
                  className="btn-primary w-full py-2 text-sm bg-amber-500 hover:bg-amber-400 text-forest-900"
                  onClick={() => openBuy(l)}
                  disabled={!l.isActive || l.availableUnits <= 0}
                >
                  {!l.isActive ? 'Unavailable' : l.availableUnits <= 0 ? 'Sold Out' : 'Purchase Energy'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subscribe Modal */}
      {subHotspot && (
        <Modal title="Subscribe to Hotspot" onClose={() => setSubHotspot(null)}>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="rounded-xl bg-cream-50 border border-cream-200 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Node</span>
                <span className="font-mono font-medium">{subHotspot.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Price</span>
                <span className="font-semibold">
                  {subHotspot.monthlyPriceHbar} ℏ
                  <span className="ml-1 font-normal text-gray-400 text-xs">≈ ${(subHotspot.monthlyPriceHbar * hbarPrice).toFixed(2)}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coverage</span>
                <span className="font-medium">{subHotspot.coverageRadiusMeters}m</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (days)</label>
              <select
                value={subDays}
                onChange={(e) => setSubDays(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">365 days</option>
              </select>
            </div>
            <div className="rounded-xl bg-forest-50 border border-forest-200 p-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Total cost</span>
                <span className="text-forest-700">
                  {(subHotspot.monthlyPriceHbar * parseInt(subDays, 10) / 30).toFixed(4)} ℏ
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>≈ USD</span>
                <span>${((subHotspot.monthlyPriceHbar * parseInt(subDays, 10) / 30) * hbarPrice).toFixed(2)}</span>
              </div>
            </div>
            {subError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{subError}</p>}
            {subSuccess && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{subSuccess}</p>}
            {!subSuccess && (
              <button type="submit" disabled={subLoading} className="btn-primary w-full disabled:opacity-50">
                {subLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Confirm Subscription
              </button>
            )}
          </form>
        </Modal>
      )}

      {/* Buy Energy Modal */}
      {buyListing && (
        <Modal title="Purchase Energy" onClose={() => setBuyListing(null)}>
          <form onSubmit={handleBuyEnergy} className="space-y-4">
            <div className="rounded-xl bg-cream-50 border border-cream-200 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span className="font-semibold">
                  {buyListing.pricePerKwhHbar} ℏ / kWh
                  <span className="ml-1 font-normal text-gray-400 text-xs">≈ ${(buyListing.pricePerKwhHbar * hbarPrice).toFixed(4)}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available</span>
                <span className="font-medium">{buyListing.availableUnits.toFixed(2)} kWh</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Units to purchase (kWh)</label>
              <input
                type="number"
                min="0.01"
                max={buyListing.availableUnits}
                step="any"
                required
                value={buyUnits}
                onChange={(e) => setBuyUnits(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                placeholder="e.g. 10"
              />
            </div>
            {buyUnits && !isNaN(parseFloat(buyUnits)) && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Total cost</span>
                  <span className="text-amber-700">
                    {(parseFloat(buyUnits) * buyListing.pricePerKwhHbar).toFixed(4)} ℏ
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>≈ USD</span>
                  <span>${(parseFloat(buyUnits) * buyListing.pricePerKwhHbar * hbarPrice).toFixed(2)}</span>
                </div>
              </div>
            )}
            {buyError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{buyError}</p>}
            {buySuccess && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{buySuccess}</p>}
            {!buySuccess && (
              <button type="submit" disabled={buyLoading} className="btn-primary w-full bg-amber-500 hover:bg-amber-400 text-forest-900 disabled:opacity-50">
                {buyLoading && <span className="inline-block w-3 h-3 border-2 border-forest-900 border-t-transparent rounded-full animate-spin mr-2" />}
                Confirm Purchase
              </button>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
