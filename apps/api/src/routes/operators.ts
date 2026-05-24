import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, issueToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

export const operatorsRouter: Router = Router();

operatorsRouter.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query['page'] ?? 1);
    const limit = Number(req.query['limit'] ?? 20);
    const skip = (page - 1) * limit;

    const [operators, total] = await Promise.all([
      prisma.operator.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { hotspots: true, solarInstallations: true } },
        },
        orderBy: { reputationScore: 'desc' },
      }),
      prisma.operator.count(),
    ]);

    res.json({ success: true, data: operators, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

operatorsRouter.get('/:id', async (req, res, next) => {
  try {
    const operator = await prisma.operator.findUnique({
      where: { id: req.params['id']! },
      include: {
        user: { select: { email: true, createdAt: true } },
        hotspots: { where: { isActive: true } },
        solarInstallations: { where: { isActive: true } },
        _count: { select: { hotspots: true } },
      },
    });
    if (!operator) throw new AppError(404, 'Operator not found');
    res.json({ success: true, data: operator });
  } catch (err) {
    next(err);
  }
});

const registerOperatorSchema = z.object({
  country: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

operatorsRouter.post('/register', requireAuth, validate(registerOperatorSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof registerOperatorSchema>;
    const existing = await prisma.operator.findUnique({ where: { hederaAccountId: req.user!.accountId } });
    if (existing) throw new AppError(400, 'Already registered as operator');

    const operator = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: req.user!.userId }, data: { role: 'OPERATOR' } });
      return tx.operator.create({
        data: { userId: req.user!.userId, hederaAccountId: req.user!.accountId, ...body },
      });
    });

    const newToken = issueToken({ userId: req.user!.userId, accountId: req.user!.accountId, role: 'OPERATOR' });
    res.status(201).json({ success: true, data: { operator, token: newToken } });
  } catch (err) {
    next(err);
  }
});

const stakeSchema = z.object({
  amount: z.number().positive(),
});

operatorsRouter.post('/stake', requireAuth, validate(stakeSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof stakeSchema>;
    const operator = await prisma.operator.findUnique({ where: { hederaAccountId: req.user!.accountId } });
    if (!operator) throw new AppError(400, 'Not registered as operator');

    const updated = await prisma.operator.update({
      where: { id: operator.id },
      data: { stakedHbar: { increment: body.amount } },
    });

    await prisma.transaction.create({
      data: {
        type: 'STAKE',
        fromAccount: req.user!.accountId,
        toAccount: null,
        amountHbar: body.amount,
        status: 'SUCCESS',
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

operatorsRouter.post('/unstake', requireAuth, validate(stakeSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof stakeSchema>;
    const operator = await prisma.operator.findUnique({ where: { hederaAccountId: req.user!.accountId } });
    if (!operator) throw new AppError(400, 'Not registered as operator');
    if (operator.stakedHbar < body.amount) throw new AppError(400, 'Insufficient staked balance');

    const updated = await prisma.operator.update({
      where: { id: operator.id },
      data: { stakedHbar: { decrement: body.amount } },
    });

    await prisma.transaction.create({
      data: {
        type: 'UNSTAKE',
        fromAccount: req.user!.accountId,
        toAccount: null,
        amountHbar: body.amount,
        status: 'SUCCESS',
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// :accountId is the Hedera account ID (e.g. 0.0.12345)
operatorsRouter.get('/:accountId/earnings', requireAuth, async (req, res, next) => {
  try {
    const hederaAccountId = req.params['accountId']!;
    if (hederaAccountId !== req.user!.accountId && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'Access denied');
    }

    const earnings = await prisma.transaction.findMany({
      where: { toAccount: hederaAccountId, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalHbar = earnings.reduce((sum: number, t) => sum + t.amountHbar, 0);
    res.json({ success: true, data: { earnings, totalHbar } });
  } catch (err) {
    next(err);
  }
});

operatorsRouter.get('/:accountId/hotspots', requireAuth, async (req, res, next) => {
  try {
    const hederaAccountId = req.params['accountId']!;
    if (hederaAccountId !== req.user!.accountId && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'Access denied');
    }

    const operator = await prisma.operator.findUnique({ where: { hederaAccountId } });
    if (!operator) {
      res.json({ success: true, data: [] });
      return;
    }

    const hotspots = await prisma.hotspot.findMany({
      where: { operatorId: operator.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: hotspots });
  } catch (err) {
    next(err);
  }
});
