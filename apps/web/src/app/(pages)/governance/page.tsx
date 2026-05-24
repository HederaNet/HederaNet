'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { Modal } from '../../../components/ui/Modal';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  votingEndsAt: string;
  proposerAccountId: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PASSED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXECUTED: 'bg-gray-50 text-gray-600 border-gray-200',
};

function VoteBar({ yes, no, abstain }: { yes: number; no: number; abstain: number }) {
  const total = yes + no + abstain;
  if (total === 0) return <div className="h-2 rounded-full bg-cream-200 w-full" />;
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full gap-px">
      <div className="bg-green-500 transition-all" style={{ width: `${(yes / total) * 100}%` }} />
      <div className="bg-red-400 transition-all" style={{ width: `${(no / total) * 100}%` }} />
      <div className="bg-gray-300 transition-all" style={{ width: `${(abstain / total) * 100}%` }} />
    </div>
  );
}

export default function GovernancePage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  // New proposal modal
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propDays, setPropDays] = useState('7');
  const [propLoading, setPropLoading] = useState(false);
  const [propError, setPropError] = useState('');

  // Per-proposal vote state: proposalId -> { loading: choice | null, error: string }
  const [voteState, setVoteState] = useState<Record<string, { loading: string | null; error: string }>>({});

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals', statusFilter],
    queryFn: async () => {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const res = await apiClient.get<{ data: Proposal[] }>(`/governance/proposals${qs}`);
      return res.data.data;
    },
    refetchInterval: 30_000,
  });

  function openProposalModal() {
    setPropTitle('');
    setPropDesc('');
    setPropDays('7');
    setPropError('');
    setShowProposalModal(true);
  }

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    setPropError('');
    setPropLoading(true);
    try {
      await apiClient.post('/governance/proposals', {
        title: propTitle,
        description: propDesc,
        votingPeriodDays: parseInt(propDays, 10),
      });
      await queryClient.invalidateQueries({ queryKey: ['proposals', statusFilter] });
      setShowProposalModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create proposal';
      setPropError(msg);
    } finally {
      setPropLoading(false);
    }
  }

  async function handleVote(proposalId: string, choice: 'YES' | 'NO' | 'ABSTAIN') {
    setVoteState((prev) => ({
      ...prev,
      [proposalId]: { loading: choice, error: '' },
    }));
    try {
      await apiClient.post('/governance/vote', { proposalId, choice });
      await queryClient.invalidateQueries({ queryKey: ['proposals', statusFilter] });
      setVoteState((prev) => ({
        ...prev,
        [proposalId]: { loading: null, error: '' },
      }));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to cast vote';
      setVoteState((prev) => ({
        ...prev,
        [proposalId]: { loading: null, error: msg },
      }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Governance</h1>
          <p className="text-sm text-gray-500 mt-1">Vote on proposals that shape the HederaNet protocol</p>
        </div>
        <button className="btn-primary py-2 text-sm" onClick={openProposalModal}>+ New Proposal</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'ACTIVE', 'PENDING', 'PASSED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-forest-700 text-white'
                : 'bg-white border border-cream-200 text-gray-600 hover:bg-cream-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-32" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🗳️</div>
          <h2 className="font-semibold text-gray-700 mb-2">No proposals yet</h2>
          <p className="text-sm text-gray-500 mb-6">Be the first to submit a governance proposal.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const total = p.yesVotes + p.noVotes + p.abstainVotes;
            const yesPercent = total > 0 ? ((p.yesVotes / total) * 100).toFixed(1) : '0';
            const endsAt = new Date(p.votingEndsAt);
            const ended = endsAt < new Date();
            const pVote = voteState[p.id];
            const isVoting = !!pVote?.loading;

            return (
              <div key={p.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 leading-snug">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[p.status] ?? STATUS_COLORS['PENDING']}`}>
                    {p.status}
                  </span>
                </div>

                <VoteBar yes={p.yesVotes} no={p.noVotes} abstain={p.abstainVotes} />

                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <div className="flex gap-4">
                    <span className="text-green-600 font-medium">✓ {p.yesVotes.toFixed(0)} Yes ({yesPercent}%)</span>
                    <span className="text-red-500 font-medium">✗ {p.noVotes.toFixed(0)} No</span>
                    <span>{p.abstainVotes.toFixed(0)} Abstain</span>
                  </div>
                  <span>{ended ? 'Ended' : 'Ends'} {endsAt.toLocaleDateString()}</span>
                </div>

                {pVote?.error && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{pVote.error}</p>
                )}

                {p.status === 'ACTIVE' && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-cream-100">
                    <button
                      disabled={isVoting}
                      onClick={() => handleVote(p.id, 'YES')}
                      className="flex-1 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors border border-green-200 disabled:opacity-50 inline-flex items-center justify-center"
                    >
                      {pVote?.loading === 'YES' && <span className="inline-block w-3 h-3 border-2 border-green-700 border-t-transparent rounded-full animate-spin mr-1" />}
                      Vote Yes
                    </button>
                    <button
                      disabled={isVoting}
                      onClick={() => handleVote(p.id, 'NO')}
                      className="flex-1 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors border border-red-200 disabled:opacity-50 inline-flex items-center justify-center"
                    >
                      {pVote?.loading === 'NO' && <span className="inline-block w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />}
                      Vote No
                    </button>
                    <button
                      disabled={isVoting}
                      onClick={() => handleVote(p.id, 'ABSTAIN')}
                      className="flex-1 py-1.5 text-xs rounded-lg bg-cream-100 text-gray-600 hover:bg-cream-200 font-medium transition-colors border border-cream-200 disabled:opacity-50 inline-flex items-center justify-center"
                    >
                      {pVote?.loading === 'ABSTAIN' && <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-1" />}
                      Abstain
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showProposalModal && (
        <Modal title="New Proposal" onClose={() => setShowProposalModal(false)}>
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (min 10 chars)</label>
              <input
                type="text"
                required
                minLength={10}
                maxLength={200}
                value={propTitle}
                onChange={(e) => setPropTitle(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                placeholder="e.g. Increase hotspot deployment rewards"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (min 50 chars)</label>
              <textarea
                required
                minLength={50}
                maxLength={5000}
                rows={4}
                value={propDesc}
                onChange={(e) => setPropDesc(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent resize-none"
                placeholder="Describe the proposal in detail..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Voting Period (days, 3–30)</label>
              <input
                type="number"
                required
                min={3}
                max={30}
                value={propDays}
                onChange={(e) => setPropDays(e.target.value)}
                className="w-full rounded-xl border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
              />
            </div>
            {propError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{propError}</p>}
            <button type="submit" disabled={propLoading} className="btn-primary w-full disabled:opacity-50">
              {propLoading && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Submit Proposal
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
