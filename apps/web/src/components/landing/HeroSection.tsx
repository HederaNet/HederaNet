'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { NetworkStats } from '@hederanet/types';

const HBAR_USD = 0.075;

interface Props {
  stats: NetworkStats | null;
}

const AFRICA_NODES = [
  { cx: 83,  cy: 144, r: 5,   color: '#3b82f6', label: 'Lagos',         pulse: true  },
  { cx: 72,  cy: 147, r: 4,   color: '#f59e0b', label: 'Accra',         pulse: true  },
  { cx: 177, cy: 169, r: 4,   color: '#a855f7', label: 'Kampala',       pulse: false },
  { cx: 190, cy: 175, r: 5,   color: '#3b82f6', label: 'Nairobi',       pulse: true  },
  { cx: 198, cy: 198, r: 3.5, color: '#f59e0b', label: 'Dar es Salaam', pulse: false },
  { cx: 162, cy: 277, r: 5,   color: '#3b82f6', label: 'Johannesburg',  pulse: true  },
  { cx: 96,  cy: 133, r: 3.5, color: '#a855f7', label: 'Abuja',         pulse: false },
  { cx: 20,  cy: 110, r: 4,   color: '#f59e0b', label: 'Dakar',         pulse: false },
  { cx: 176, cy: 106, r: 3.5, color: '#3b82f6', label: 'Khartoum',      pulse: false },
  { cx: 170, cy: 274, r: 3.5, color: '#f59e0b', label: 'Maputo',        pulse: false },
];

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [6, 7], [2, 8], [3, 9], [1, 6],
];

function AfricaNetworkViz() {
  return (
    <svg viewBox="0 0 260 340" className="w-full max-w-sm mx-auto drop-shadow-2xl" aria-hidden>
      {/* Africa silhouette */}
      <path
        d="M 53 27 Q 80 22 105 19 Q 118 38 124 48 Q 140 38 160 42 L 175 48
           Q 188 68 191 80 Q 205 102 209 107 Q 225 115 235 124
           Q 222 148 207 162 Q 202 172 200 210 Q 192 232 186 243
           Q 178 268 163 295 Q 143 308 130 309
           Q 119 298 117 262 Q 107 242 105 222 Q 100 200 97 183
           Q 94 167 95 154 Q 82 148 60 153 Q 48 153 47 154
           Q 30 140 22 127 L 18 110 Q 19 88 28 68 Q 40 48 53 27 Z"
        fill="white"
        fillOpacity={0.06}
        stroke="white"
        strokeOpacity={0.18}
        strokeWidth={1.5}
      />

      {/* Connection lines */}
      {CONNECTIONS.map(([a, b], i) => {
        const na = AFRICA_NODES[a], nb = AFRICA_NODES[b];
        return (
          <line
            key={i}
            x1={na.cx} y1={na.cy}
            x2={nb.cx} y2={nb.cy}
            stroke="#f59e0b"
            strokeOpacity={0.3}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        );
      })}

      {/* Nodes */}
      {AFRICA_NODES.map((n, i) => (
        <g key={i}>
          {n.pulse && (
            <circle cx={n.cx} cy={n.cy} r={n.r + 6} fill={n.color} fillOpacity={0.15}>
              <animate attributeName="r" values={`${n.r + 4};${n.r + 10};${n.r + 4}`} dur="2.5s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
              <animate attributeName="fill-opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </circle>
          )}
          <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.color} stroke="white" strokeWidth={1.5} strokeOpacity={0.8} />
        </g>
      ))}

      {/* Layer legend */}
      <g transform="translate(10, 305)">
        <circle cx="6" cy="6" r="4" fill="#3b82f6" />
        <text x="14" y="10" fill="white" fillOpacity={0.7} fontSize="9">Internet</text>
        <circle cx="62" cy="6" r="4" fill="#f59e0b" />
        <text x="70" y="10" fill="white" fillOpacity={0.7} fontSize="9">Solar</text>
        <circle cx="110" cy="6" r="4" fill="#a855f7" />
        <text x="118" y="10" fill="white" fillOpacity={0.7} fontSize="9">Compute</text>
      </g>
    </svg>
  );
}

export function HeroSection({ stats }: Props) {
  const totalVolumeUsd = stats ? (stats.totalHbarSettled * HBAR_USD) : 0;

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 flex items-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '36px 36px' }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-forest-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-white"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Live on Hedera Testnet
          </div>

          <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Community-Owned <br />
            <span className="text-amber-400">Internet & Energy</span> <br />
            for Africa
          </h1>

          <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-lg">
            HederaNet turns African community members into infrastructure entrepreneurs —
            earning real income from mesh internet, solar energy trading, and edge compute
            on the Hedera Hashgraph blockchain.
          </p>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-400">{stats.totalActiveHotspots}</div>
                <div className="text-xs text-white/60 mt-0.5">Active Nodes</div>
              </div>
              <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-400">{stats.totalUsers}</div>
                <div className="text-xs text-white/60 mt-0.5">Members</div>
              </div>
              <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-400">{stats.energyTradedKwhToday.toFixed(1)}</div>
                <div className="text-xs text-white/60 mt-0.5">kWh Today</div>
              </div>
              <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-amber-400">${totalVolumeUsd.toFixed(0)}</div>
                <div className="text-xs text-white/60 mt-0.5">Volume (USD)</div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <Link href="/map" className="btn-primary bg-amber-500 hover:bg-amber-400 text-forest-900 font-semibold">
              Explore Network Map
            </Link>
            <Link href="/explorer" className="btn-secondary border-white/40 text-white hover:bg-white/10">
              View Chain Explorer
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:flex flex-col items-center gap-6"
        >
          <AfricaNetworkViz />

          <div className="flex gap-6 text-center">
            {[
              { icon: '📡', label: 'Mesh Internet', desc: '$15–40/mo per hotspot' },
              { icon: '☀️', label: 'Solar Trading', desc: 'kWh peer-to-peer' },
              { icon: '⚡', label: 'Edge Compute', desc: 'Pay-per-compute' },
            ].map((item) => (
              <div key={item.label} className="flex-1 rounded-xl bg-white/8 border border-white/10 p-3 backdrop-blur-sm">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-semibold text-white">{item.label}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
