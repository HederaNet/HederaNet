import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

export const governanceRouter: Router = Router();

governanceRouter.get('/proposals', async (req, res, next) => {
  try {
    const page = Number(req.query['page'] ?? 1);
    const limit = Number(req.query['limit'] ?? 20);
    const status = req.query['status'] as string | undefined;

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        ...(status ? { where: { status: status as 'PENDING' | 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED' } } : {}),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.proposal.count(status ? { where: { status: status as 'PENDING' | 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED' } } : undefined),
    ]);

    res.json({ success: true, data: proposals, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

governanceRouter.get('/proposals/:id', async (req, res, next) => {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: req.params['id']! },
      include: { _count: { select: { votes: true } } },
    });
    if (!proposal) throw new AppError(404, 'Proposal not found');
    res.json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
});

const createProposalSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  votingPeriodDays: z.number().int().min(3).max(30).default(7),
  txHashHedera: z.string().optional(),
});

governanceRouter.post('/proposals', requireAuth, validate(createProposalSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createProposalSchema>;
    const votingEndsAt = new Date(Date.now() + body.votingPeriodDays * 86400_000 + 2 * 86400_000);

    const proposal = await prisma.proposal.create({
      data: {
        proposerAccountId: req.user!.accountId,
        title: body.title,
        description: body.description,
        votingEndsAt,
        status: 'PENDING',
      },
    });
    res.status(201).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
});

const voteSchema = z.object({
  proposalId: z.string().cuid(),
  choice: z.enum(['YES', 'NO', 'ABSTAIN']),
  txHashHedera: z.string().optional(),
});

governanceRouter.post('/vote', requireAuth, validate(voteSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof voteSchema>;
    const proposal = await prisma.proposal.findUnique({ where: { id: body.proposalId } });
    if (!proposal) throw new AppError(404, 'Proposal not found');
    if (proposal.status !== 'ACTIVE') throw new AppError(400, 'Proposal is not active');
    if (new Date() > proposal.votingEndsAt) throw new AppError(400, 'Voting period has ended');

    const existing = await prisma.vote.findUnique({
      where: { proposalId_voterAccountId: { proposalId: body.proposalId, voterAccountId: req.user!.accountId } },
    });
    if (existing) throw new AppError(400, 'Already voted on this proposal');

    const votingPower = 1; // TODO: calculate from staking/reputation

    const [vote] = await prisma.$transaction([
      prisma.vote.create({
        data: { proposalId: body.proposalId, voterAccountId: req.user!.accountId, choice: body.choice, votingPower, txHashHedera: body.txHashHedera ?? null },
      }),
      prisma.proposal.update({
        where: { id: body.proposalId },
        data: {
          ...(body.choice === 'YES' && { yesVotes: { increment: votingPower } }),
          ...(body.choice === 'NO' && { noVotes: { increment: votingPower } }),
          ...(body.choice === 'ABSTAIN' && { abstainVotes: { increment: votingPower } }),
        },
      }),
    ]);

    res.status(201).json({ success: true, data: vote });
  } catch (err) {
    next(err);
  }
});
