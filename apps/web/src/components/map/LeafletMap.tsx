'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useQueryClient } from '@tanstack/react-query';
import type L from 'leaflet';
import type { Hotspot, SolarInstallation } from '@hederanet/types';
import { apiClient } from '../../lib/api';
import 'leaflet/dist/leaflet.css';

export interface LeafletMapHandle {
  flyTo: (lat: number, lng: number) => void;
}

interface Props {
  hotspots: Hotspot[];
  solarInstallations: SolarInstallation[];
  showInternet: boolean;
  showEnergy: boolean;
}

// Grabs the Leaflet map instance and stores it in a ref so NetworkMap can call flyTo
function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

function HotspotPopup({ hotspot }: { hotspot: Hotspot }) {
  const queryClient = useQueryClient();

  async function subscribe(btn: HTMLButtonElement, errEl: HTMLElement, okEl: HTMLElement) {
    btn.disabled = true;
    btn.textContent = 'Subscribing…';
    try {
      await apiClient.post('/subscriptions', { hotspotId: hotspot.id, durationDays: 30 });
      okEl.textContent = 'Subscribed! 30-day access activated.';
      okEl.style.display = 'block';
      btn.style.display = 'none';
      void queryClient.invalidateQueries({ queryKey: ['map-hotspots'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Sign in to subscribe';
      errEl.textContent = msg;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = `Subscribe — ${hotspot.monthlyPriceHbar} ℏ/mo`;
    }
  }

  return (
    <div className="p-1 min-w-[230px]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${hotspot.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="font-bold text-sm text-gray-900">
          {hotspot.isActive ? '🟢 Online' : '⚫ Offline'} · Hotspot
        </span>
      </div>
      <div className="text-xs font-mono text-gray-400 mb-3 truncate">{hotspot.id}</div>
      <div className="space-y-1.5 text-xs text-gray-600 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Monthly Price</span>
          <span className="font-semibold text-gray-900">{hotspot.monthlyPriceHbar} ℏ</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">30-Day Uptime</span>
          <span className={`font-semibold ${hotspot.uptimePct30d >= 95 ? 'text-green-600' : 'text-amber-600'}`}>
            {hotspot.uptimePct30d.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Coverage Radius</span>
          <span className="font-semibold text-gray-900">{hotspot.coverageRadiusMeters}m</span>
        </div>
      </div>
      <div
        id={`err-${hotspot.id}`}
        style={{ display: 'none' }}
        className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mb-2"
      />
      <div
        id={`ok-${hotspot.id}`}
        style={{ display: 'none' }}
        className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mb-2"
      />
      {hotspot.isActive && (
        <button
          id={`btn-${hotspot.id}`}
          onClick={(e) => {
            const btn = e.currentTarget;
            const errEl = document.getElementById(`err-${hotspot.id}`)!;
            const okEl = document.getElementById(`ok-${hotspot.id}`)!;
            void subscribe(btn, errEl, okEl);
          }}
          className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Subscribe — {hotspot.monthlyPriceHbar} ℏ/mo
        </button>
      )}
      {!hotspot.isActive && (
        <div className="w-full py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold text-center">
          Node Offline
        </div>
      )}
    </div>
  );
}

function SolarPopup({ installation }: { installation: SolarInstallation }) {
  const listings = installation.listings ?? [];
  const minPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.pricePerKwhHbar)) : null;
  const totalUnits = listings.reduce((s, l) => s + l.availableUnits, 0);

  return (
    <div className="p-1 min-w-[230px]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">☀️</span>
        <span className="font-bold text-sm text-gray-900">Solar Installation</span>
      </div>
      {installation.operator && (
        <div className="text-xs text-gray-500 mb-3">
          {installation.operator.city}, {installation.operator.country} · {installation.operator.tier} operator
        </div>
      )}
      <div className="space-y-1.5 text-xs text-gray-600 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Capacity</span>
          <span className="font-semibold text-gray-900">{installation.capacityKw} kW</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Active Listings</span>
          <span className="font-semibold text-gray-900">{listings.length}</span>
        </div>
        {minPrice !== null && (
          <div className="flex justify-between">
            <span className="text-gray-500">From</span>
            <span className="font-semibold text-amber-700">{minPrice} ℏ/kWh</span>
          </div>
        )}
        {totalUnits > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Available</span>
            <span className="font-semibold text-gray-900">{totalUnits.toFixed(1)} kWh</span>
          </div>
        )}
      </div>
      <a
        href="/dashboard/energy"
        className="block w-full py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors text-center"
      >
        Browse Energy Listings →
      </a>
    </div>
  );
}

const LeafletMap = forwardRef<LeafletMapHandle, Props>(function LeafletMap(
  { hotspots, solarInstallations, showInternet, showEnergy },
  ref,
) {
  const mapInstanceRef = useRef<L.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number) => {
      mapInstanceRef.current?.flyTo([lat, lng], 14, { animate: true, duration: 1.2 });
    },
  }));

  return (
    <MapContainer
      center={[5, 20]}
      zoom={4}
      style={{ width: '100%', height: '100%', flex: 1 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController mapRef={mapInstanceRef} />

      {/* ── Internet Hotspots ── */}
      {showInternet && hotspots.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          radius={11}
          pathOptions={{
            color: 'white',
            weight: 2.5,
            fillColor: h.isActive ? '#2563eb' : '#9ca3af',
            fillOpacity: 0.92,
          }}
        >
          <Popup maxWidth={260}>
            <HotspotPopup hotspot={h} />
          </Popup>
        </CircleMarker>
      ))}

      {/* ── Solar Energy Installations ── */}
      {showEnergy && solarInstallations.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={11}
          pathOptions={{
            color: 'white',
            weight: 2.5,
            fillColor: '#f59e0b',
            fillOpacity: 0.92,
          }}
        >
          <Popup maxWidth={260}>
            <SolarPopup installation={s} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
});

export default LeafletMap;
