'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

interface EnergyListing {
  pricePerKwhHbar: number;
  isActive: boolean;
}
interface Hotspot {
  monthlyPriceHbar: number;
  isActive: boolean;
}
interface MarketToken {
  symbol: string;
  priceUsdc: number;
}

export function EarningsCalculator() {
  const [panels, setPanels] = useState(5);
  const [subscribers, setSubscribers] = useState(10);

  // Fetch real prices from the network
  const { data: energyListings = [] } = useQuery({
    queryKey: ['calc-energy'],
    queryFn: async () => {
      const res = await axios.get<{ data: EnergyListing[] }>(`${API}/energy/listings?limit=50`);
      return res.data.data;
    },
    staleTime: 120_000,
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['calc-hotspots'],
    queryFn: async () => {
      const res = await axios.get<{ data: Hotspot[] }>(`${API}/hotspots?lat=0&lng=20&radiusKm=5000&limit=100`);
      return res.data.data;
    },
    staleTime: 120_000,
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['calc-tokens'],
    queryFn: async () => {
      const res = await axios.get<{ data: MarketToken[] }>(`${API}/market/tokens`);
      return res.data.data;
    },
    staleTime: 300_000,
  });

  // Derive real average prices, fall back to conservative estimates if no data yet
  const activeEnergy = energyListings.filter((l) => l.isActive);
  const avgEnergyPriceHbar = activeEnergy.length > 0
    ? activeEnergy.reduce((s, l) => s + l.pricePerKwhHbar, 0) / activeEnergy.length
    : 0.12;

  const activeHotspots = hotspots.filter((h) => h.isActive);
  const avgSubPriceHbar = activeHotspots.length > 0
    ? activeHotspots.reduce((s, h) => s + h.monthlyPriceHbar, 0) / activeHotspots.length
    : 5;

  const hbarToken = tokens.find((t) => t.symbol === 'HBAR');
  const hbarUsd = hbarToken?.priceUsdc ?? 0.075;

  // 120 kWh/panel/month is a standard solar estimate for sub-Saharan Africa
  const solarKwhMonth = panels * 120;
  const solarHbar = solarKwhMonth * avgEnergyPriceHbar;
  const internetHbar = subscribers * avgSubPriceHbar;
  const totalHbar = solarHbar + internetHbar;
  const totalUsd = totalHbar * hbarUsd;

  const usingRealData = activeEnergy.length > 0 || activeHotspots.length > 0;

  return (
    <section className="py-24 bg-forest-900 text-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl font-bold mb-4">Calculate Your Earnings</h2>
          <p className="text-white/70 text-lg">
            Based on {usingRealData ? 'live network prices from the Hedera testnet' : 'network estimates — prices update as operators join'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Solar Panels: <span className="text-amber-400 font-bold">{panels}</span>
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={panels}
                onChange={(e) => setPanels(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>1 panel</span>
                <span>50 panels</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Internet Subscribers: <span className="text-amber-400 font-bold">{subscribers}</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={subscribers}
                onChange={(e) => setSubscribers(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>1 subscriber</span>
                <span>100 subscribers</span>
              </div>
            </div>

            {usingRealData && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/50 space-y-1">
                <div>Energy price: {avgEnergyPriceHbar.toFixed(4)} ℏ/kWh (network avg)</div>
                <div>Subscription price: {avgSubPriceHbar.toFixed(2)} ℏ/mo (network avg)</div>
                <div>HBAR price: ${hbarUsd.toFixed(4)} USDC (market)</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Solar Energy Income</span>
                <span className="font-bold text-amber-400">{solarHbar.toFixed(2)} ℏ/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Internet Subscriptions</span>
                <span className="font-bold text-amber-400">{internetHbar.toFixed(2)} ℏ/mo</span>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Monthly Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">{totalHbar.toFixed(2)} ℏ</div>
                    <div className="text-sm text-white/50">≈ ${totalUsd.toFixed(2)} USD</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/40 text-center">
              {usingRealData
                ? 'Prices sourced from live network · updated every 2 min'
                : 'Conservative estimates · will reflect live prices once operators join'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
