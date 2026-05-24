import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-forest-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-serif font-bold text-xl mb-4">
            <img src="/logo.svg" alt="HederaNet" className="w-7 h-7 flex-shrink-0" />
            HederaNet
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Community-owned internet, solar energy, and edge compute for Africa. Built on Hedera Hashgraph.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-4">Platform</div>
          <div className="space-y-2 text-sm text-white/60">
            <div><Link href="/map" className="hover:text-white">Network Map</Link></div>
            <div><Link href="/explore" className="hover:text-white">Market</Link></div>
            <div><Link href="/explorer" className="hover:text-white">Chain Explorer</Link></div>
            <div><Link href="/dashboard/market" className="hover:text-white">Swap</Link></div>
            <div><Link href="/dashboard" className="hover:text-white">Dashboard</Link></div>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-4">Resources</div>
          <div className="space-y-2 text-sm text-white/60">
            <div><Link href="/docs" className="hover:text-white">Documentation</Link></div>
            <div><a href="https://github.com/HederaNet/HederaNet" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></div>
            <div><a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer" className="hover:text-white">HashScan Explorer</a></div>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-4">Token Addresses</div>
          <div className="space-y-2 text-xs text-white/40 font-mono">
            {[
              { label: 'HNET', id: process.env['NEXT_PUBLIC_HNET_TOKEN_ID'] ?? '0.0.7153593' },
              { label: 'HEC', id: process.env['NEXT_PUBLIC_HEC_TOKEN_ID'] ?? '0.0.7153605' },
              { label: 'HCC', id: process.env['NEXT_PUBLIC_HCC_TOKEN_ID'] ?? '0.0.7153651' },
              { label: 'REP NFT', id: process.env['NEXT_PUBLIC_REP_NFT_ID'] ?? '0.0.7153666' },
            ].map(({ label, id }) => (
              <div key={label}>
                <a
                  href={`https://hashscan.io/testnet/token/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/70 transition-colors"
                >
                  {label}: {id}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-white/40">© 2024 HederaNet. MIT Licensed. Open Source.</div>
        <div className="text-sm text-white/40">Built with ❤️ for African communities</div>
      </div>
    </footer>
  );
}
