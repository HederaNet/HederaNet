import Link from 'next/link';

export function InvestorCTA() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6">
          Backed by Hedera. Built for Africa.
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          HederaNet is an open-source DePIN protocol aligned with UNICEF's mission to connect
          the next billion users. We're building verifiable infrastructure where every transaction
          is on-chain and every community member can participate.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          {[
            { title: 'Open Source', description: 'MIT licensed. All code on GitHub. All data on Hedera HCS.', icon: '🌐' },
            { title: 'UNICEF Aligned', description: 'Connecting schools, clinics, and communities. Impact measurable on-chain.', icon: '🏥' },
            { title: 'Hedera Native', description: 'Built on HCS, HTS, HSCS — the fastest, most sustainable DLT.', icon: '⚡' },
          ].map((item) => (
            <div key={item.title} className="card">
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="font-semibold text-gray-900 mb-2">{item.title}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/explorer" className="btn-primary">
            View Chain Explorer
          </Link>
          <a
            href="https://github.com/HederaNet/HederaNet"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
