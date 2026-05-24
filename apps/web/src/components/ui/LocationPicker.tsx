'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
  label: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface Props {
  value: Location | null;
  onChange: (loc: Location) => void;
  placeholder?: string;
}

export function LocationPicker({ value, onChange, placeholder = 'Search city or address…' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=ng,ke,gh,za,tz,ug,et,cm,ci,sn,ma,eg,dz,tn,ly,sd,so,mz,zm,zw,bw,ao,cd,rw,bi,mw,ls,sz,na,ga,cg,cf,td,ne,ml,gn,sl,lr,bf,gm,gw,mr,cv,sc,km,mg,mu`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 450);
  }

  function selectResult(r: NominatimResult) {
    const loc: Location = {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      label: r.display_name.split(',').slice(0, 2).join(', '),
    };
    onChange(loc);
    setQuery(loc.label);
    setOpen(false);
    setResults([]);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data = await res.json() as { display_name?: string };
          const label = data.display_name
            ? data.display_name.split(',').slice(0, 2).join(', ')
            : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange({ lat: latitude, lng: longitude, label });
          setQuery(label);
        } catch {
          onChange({ lat: latitude, lng: longitude, label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
          setQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setGeoLoading(false);
        }
      },
      () => setGeoLoading(false),
      { timeout: 8000 },
    );
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-cream-200 px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
          />
          {loading && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-forest-400 border-t-transparent rounded-full animate-spin" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoLoading}
          title="Use my location"
          className="flex-shrink-0 px-3 py-2 rounded-xl border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors disabled:opacity-50 text-sm"
        >
          {geoLoading
            ? <span className="inline-block w-4 h-4 border-2 border-forest-400 border-t-transparent rounded-full animate-spin" />
            : '📍'}
        </button>
      </div>

      {value && (
        <p className="mt-1 text-xs text-gray-400">
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-cream-200 rounded-xl shadow-lg overflow-hidden text-sm max-h-52 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-cream-50 transition-colors truncate text-gray-700"
                onClick={() => selectResult(r)}
              >
                {r.display_name.split(',').slice(0, 3).join(', ')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
