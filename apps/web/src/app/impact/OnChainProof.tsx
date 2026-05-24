'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const MIRROR = 'https://testnet.mirrornode.hedera.com';
const NETWORK = 'testnet';

interface TopicMessage {
  consensus_timestamp: string;
  sequence_number: number;
  message: string;
}

// IDs from environment — fall back to deployed testnet IDs
const TOPICS = [
  {
    id: process.env['NEXT_PUBLIC_HCS_TOPIC_HOTSPOT'] ?? '0.0.1005',
    name: 'Service Quality Topic',
    description: 'Hotspot uptime confirmations and quality scores',
  },
  {
    id: process.env['NEXT_PUBLIC_HCS_TOPIC_GOVERNANCE'] ?? '0.0.1006',
    name: 'Governance Topic',
    description: 'On-chain governance proposals and votes',
  },
  {
    id: process.env['NEXT_PUBLIC_HCS_TOPIC_ENERGY'] ?? '0.0.1007',
    name: 'Energy Trading Topic',
    description: 'IoT-confirmed energy delivery records',
  },
];

const TOKENS = [
  {
    id: process.env['NEXT_PUBLIC_HNET_TOKEN_ID'] ?? '0.0.7153593',
    symbol: 'HNET',
    description: 'Governance and staking token',
  },
  {
    id: process.env['NEXT_PUBLIC_HEC_TOKEN_ID'] ?? '0.0.7153605',
    symbol: 'HEC',
    description: 'Energy credit token (1 HEC = 1 kWh)',
  },
  {
    id: process.env['NEXT_PUBLIC_HCC_TOKEN_ID'] ?? '0.0.7153651',
    symbol: 'HCC',
    description: 'Compute credit token',
  },
  {
    id: process.env['NEXT_PUBLIC_REP_NFT_ID'] ?? '0.0.7153666',
    symbol: 'REP NFT',
    description: 'Operator reputation NFT collection',
  },
];

function TopicCard({ topic }: { topic: typeof TOPICS[0] }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hcs-topic', topic.id],
    queryFn: async () => {
      const res = await axios.get<{ messages: TopicMessage[] }>(
        `${MIRROR}/api/v1/topics/${topic.id}/messages?limit=1&order=desc`,
      );
      return res.data.messages ?? [];
    },
    staleTime: 60_000,
    retry: false,
  });

  const latestMsg = data?.[0];

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-100">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-semibold text-gray-900">{topic.id}</div>
        <div className="text-xs font-medium text-forest-700">{topic.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{topic.description}</div>
        {isLoading && <div className="text-xs text-gray-400 mt-1">Fetching latest message…</div>}
        {!isLoading && !isError && latestMsg && (
          <div className="text-xs text-gray-400 mt-1">
            Last message: seq #{latestMsg.sequence_number} ·{' '}
            {new Date(parseFloat(latestMsg.consensus_timestamp) * 1000).toLocaleString()}
          </div>
        )}
        {!isLoading && (isError || !latestMsg) && (
          <div className="text-xs text-gray-400 mt-1">No messages yet on testnet</div>
        )}
      </div>
      <a
        href={`https://hashscan.io/${NETWORK}/topic/${topic.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline whitespace-nowrap flex-shrink-0"
      >
        View ↗
      </a>
    </div>
  );
}

interface TokenInfo {
  name?: string;
  symbol?: string;
  total_supply?: string;
  decimals?: string;
}

function TokenCard({ token }: { token: typeof TOKENS[0] }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hedera-token', token.id],
    queryFn: async () => {
      const res = await axios.get<TokenInfo>(`${MIRROR}/api/v1/tokens/${token.id}`);
      return res.data;
    },
    staleTime: 300_000,
    retry: false,
  });

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-100">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-semibold text-gray-900">{token.id}</div>
        <div className="text-xs font-medium text-amber-700">{token.symbol}</div>
        <div className="text-xs text-gray-500 mt-0.5">{token.description}</div>
        {isLoading && <div className="text-xs text-gray-400 mt-1">Loading from mirror node…</div>}
        {!isLoading && !isError && data && (
          <div className="text-xs text-gray-400 mt-1">
            {data.name && `${data.name} · `}
            {data.total_supply && `Supply: ${parseInt(data.total_supply).toLocaleString()}`}
          </div>
        )}
        {!isLoading && isError && (
          <div className="text-xs text-gray-400 mt-1">Token not yet deployed</div>
        )}
      </div>
      <a
        href={`https://hashscan.io/${NETWORK}/token/${token.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline whitespace-nowrap flex-shrink-0"
      >
        View ↗
      </a>
    </div>
  );
}

export function OnChainProof() {
  return (
    <section>
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">On-Chain Verification</h2>
      <p className="text-gray-600 mb-8">
        All HederaNet data is verifiable on Hedera Hashgraph. Live data fetched from the Hedera Mirror Node.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="font-semibold text-lg mb-4 text-forest-700">HCS Topics ({NETWORK})</h3>
          <div className="space-y-3">
            {TOPICS.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-lg mb-4 text-forest-700">Tokens & NFTs ({NETWORK})</h3>
          <div className="space-y-3">
            {TOKENS.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
