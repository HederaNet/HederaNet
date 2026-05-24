'use client';

import { motion } from 'framer-motion';

const layers = [
  {
    icon: '📡',
    title: 'Mesh Internet',
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-700',
    description: 'Community members host Wi-Fi hotspots and earn HBAR for every subscriber. No central ISP. No gatekeepers.',
    metrics: ['$15-40/month per hotspot', '99%+ uptime SLA', 'Hedera Service Payments'],
  },
  {
    icon: '☀️',
    title: 'Solar Energy Trading',
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
    description: 'Solar panel owners list excess energy on-chain. Neighbors buy kWh peer-to-peer, confirmed by IoT oracles.',
    metrics: ['Real-time kWh pricing', 'IoT oracle verification', 'HEC energy credits'],
  },
  {
    icon: '⚡',
    title: 'Edge Compute',
    color: 'bg-purple-50 border-purple-200',
    accent: 'text-purple-700',
    description: 'Operators rent compute capacity for AI inference, data processing, and storage — earning while their nodes are idle.',
    metrics: ['Pay-per-compute-job', 'HNET governance token', 'Reputation NFTs'],
  },
];

export function InfrastructureExplainer() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">
            Three Infrastructure Layers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            HederaNet is a vertically integrated DePIN platform. Own nodes across all three layers
            to maximize your income.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.title}
              className={`card border-2 ${layer.color}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl mb-4">{layer.icon}</div>
              <h3 className={`font-serif text-2xl font-bold mb-3 ${layer.accent}`}>{layer.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{layer.description}</p>
              <ul className="space-y-2">
                {layer.metrics.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-forest-600">✓</span> {m}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
