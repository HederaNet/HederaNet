'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';
import { LocationPicker } from './LocationPicker';
import { useWallet } from '../wallet/WalletContext';

interface LocValue { lat: number; lng: number; label: string; }

export function OperatorRegistrationCard() {
  const { refreshAuth } = useWallet();

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [loc, setLoc] = useState<LocValue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loc) { setError('Please select a location'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post<{ data: { operator: unknown; token: string } }>(
        '/operators/register',
        { country: country.trim(), city: city.trim(), lat: loc.lat, lng: loc.lng },
      );
      await refreshAuth(res.data.data.token);
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card bg-green-50 border-green-200 text-center py-10">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-semibold text-green-800 mb-1 text-lg">You're now an Operator!</h3>
        <p className="text-sm text-green-700">Your profile is live on the network. You can now deploy hotspots and list solar energy.</p>
      </div>
    );
  }

  return (
    <div className="card bg-amber-50 border-amber-200">
      <h2 className="font-semibold text-amber-900 mb-1 text-base">Become an Operator</h2>
      <p className="text-sm text-amber-700 mb-4">
        Register your operator profile to deploy hotspots and list solar energy. Your profile is published to the HederaNet network.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Nigeria"
              className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lagos"
              className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Location (for network map)</label>
          <LocationPicker value={loc} onChange={setLoc} placeholder="Search your city…" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={loading || !loc || !country.trim() || !city.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading && (
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          )}
          Register as Operator
        </button>
      </form>
    </div>
  );
}
