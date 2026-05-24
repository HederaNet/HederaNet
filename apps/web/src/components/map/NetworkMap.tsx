'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Hotspot, SolarInstallation } from '@hederanet/types';
import type { LeafletMapHandle } from './LeafletMap';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-cream-50">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-forest-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

type Layer = 'internet' | 'energy' | 'compute';

const LAYER_META = {
  internet: { label: 'Internet Hotspots', icon: '📡', dot: 'bg-blue-500', activeBg: 'bg-blue-50', activeText: 'text-blue-700', activeBorder: 'border-blue-200' },
  energy:   { label: 'Solar Energy',      icon: '☀️', dot: 'bg-amber-500', activeBg: 'bg-amber-50', activeText: 'text-amber-700', activeBorder: 'border-amber-200' },
  compute:  { label: 'Edge Compute',      icon: '⚡', dot: 'bg-purple-500', activeBg: 'bg-purple-50', activeText: 'text-purple-700', activeBorder: 'border-purple-200' },
} as const;

export function NetworkMap() {
  const mapRef = useRef<LeafletMapHandle | null>(null);
  const [layers, setLayers] = useState<Record<Layer, boolean>>({
    internet: true,
    energy: true,
    compute: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLayer, setActiveLayer] = useState<Layer>('internet');

  const { data: hotspots = [] } = useQuery({
    queryKey: ['map-hotspots'],
    queryFn: async () => {
      const res = await axios.get<{ data: Hotspot[] }>(
        `${API}/hotspots?lat=0&lng=20&radiusKm=5000&limit=200`,
      );
      return res.data.data;
    },
    refetchInterval: 60_000,
  });

  const { data: solarInstallations = [] } = useQuery({
    queryKey: ['map-solar'],
    queryFn: async () => {
      const res = await axios.get<{ data: SolarInstallation[] }>(`${API}/energy/installations`);
      return res.data.data;
    },
    refetchInterval: 60_000,
  });

  const toggleLayer = useCallback((layer: Layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  function flyToItem(lat: number, lng: number) {
    mapRef.current?.flyTo(lat, lng);
  }

  const sidebarItems: Array<{ id: string; label: string; sub: string; lat: number; lng: number; online: boolean; layer: Layer }> = [
    ...hotspots.map((h) => ({
      id: h.id,
      label: `Hotspot · ${h.id.slice(-6).toUpperCase()}`,
      sub: `${h.uptimePct30d.toFixed(0)}% uptime · ${h.monthlyPriceHbar} ℏ/mo`,
      lat: h.lat,
      lng: h.lng,
      online: h.isActive,
      layer: 'internet' as Layer,
    })),
    ...solarInstallations.map((s) => ({
      id: s.id,
      label: `Solar · ${s.capacityKw} kW`,
      sub: (s as SolarInstallation & { operator?: { city?: string; country?: string } }).operator
        ? `${(s as SolarInstallation & { operator?: { city?: string } }).operator?.city ?? ''}`
        : 'Solar installation',
      lat: s.lat,
      lng: s.lng,
      online: s.isActive,
      layer: 'energy' as Layer,
    })),
  ];

  const visibleItems = sidebarItems.filter((item) => {
    if (activeLayer === 'internet') return item.layer === 'internet';
    if (activeLayer === 'energy') return item.layer === 'energy';
    return false;
  });

  const meta = LAYER_META[activeLayer];

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <div
        className={`z-[1000] bg-white border-r border-cream-200 flex flex-col shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Layer tabs */}
        <div className="flex border-b border-cream-200">
          {(Object.keys(LAYER_META) as Layer[]).map((key) => {
            const m = LAYER_META[key];
            return (
              <button
                key={key}
                onClick={() => { setActiveLayer(key); if (!layers[key]) toggleLayer(key); }}
                className={`flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors gap-1 ${
                  activeLayer === key
                    ? `${m.activeBg} ${m.activeText} border-b-2 border-current`
                    : 'text-gray-400 hover:text-gray-600 hover:bg-cream-50'
                }`}
              >
                <span className="text-base">{m.icon}</span>
                <span className="leading-tight text-center">{key === 'internet' ? 'Internet' : key === 'energy' ? 'Solar' : 'Compute'}</span>
              </button>
            );
          })}
        </div>

        {/* Count header */}
        <div className="px-4 py-2.5 border-b border-cream-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {activeLayer === 'compute'
              ? 'No compute nodes yet'
              : `${visibleItems.length} ${meta.label}`}
          </span>
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
        </div>

        {/* Node list */}
        <div className="overflow-y-auto flex-1">
          {activeLayer === 'compute' ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
              <span className="text-4xl mb-3">⚡</span>
              <p className="text-sm font-medium text-gray-500 mb-1">No Compute Nodes Yet</p>
              <p className="text-xs">Edge compute infrastructure is coming soon to the HederaNet testnet.</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
              <span className="text-4xl mb-3">{meta.icon}</span>
              <p className="text-xs">No {meta.label.toLowerCase()} registered yet.</p>
            </div>
          ) : (
            visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => flyToItem(item.lat, item.lng)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-cream-50 border-b border-cream-100 text-left transition-colors group"
              >
                <span className={`mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${item.online ? meta.dot : 'bg-gray-300'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-800 group-hover:text-forest-700 truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{item.sub}</div>
                  <div className="text-xs text-gray-300 mt-0.5 font-mono">
                    {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-forest-500 text-xs flex-shrink-0 mt-0.5">→</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Sidebar toggle button ────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-4 left-4 z-[1001] bg-white border border-cream-200 shadow-md rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-forest-700 transition-colors"
        style={{ left: sidebarOpen ? '17.5rem' : '1rem' }}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>

      {/* ── Layer toggles (top-right) ────────────────────────────── */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-2xl shadow-lg border border-cream-200 p-3 space-y-1.5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Layers</div>
        {(Object.keys(LAYER_META) as Layer[]).map((key) => {
          const m = LAYER_META[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                layers[key] ? `${m.activeBg} ${m.activeText}` : 'text-gray-400 hover:bg-cream-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${layers[key] ? m.dot : 'bg-gray-300'}`} />
              {m.icon} {key === 'internet' ? 'Internet' : key === 'energy' ? 'Solar Energy' : 'Compute'}
            </button>
          );
        })}
      </div>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <LeafletMap
          ref={mapRef}
          hotspots={layers.internet ? hotspots : []}
          solarInstallations={layers.energy ? solarInstallations : []}
          showInternet={layers.internet}
          showEnergy={layers.energy}
        />
      </div>
    </div>
  );
}
