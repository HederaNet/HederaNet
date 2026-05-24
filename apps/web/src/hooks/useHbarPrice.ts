'use client';

import { useQuery } from '@tanstack/react-query';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export function useHbarPrice(): number {
  const { data } = useQuery<number>({
    queryKey: ['hbar-price'],
    queryFn: async () => {
      const r = await fetch(`${API}/market/tokens`);
      if (!r.ok) return 0.075;
      const j = await r.json() as { data: { symbol: string; priceUsdc: number }[] };
      return j.data.find((t) => t.symbol === 'HBAR')?.priceUsdc ?? 0.075;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  return data ?? 0.075;
}
