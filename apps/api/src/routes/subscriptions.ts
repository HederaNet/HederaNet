import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

export const subscriptionsRouter: Router = Router();

const createSubscriptionSchema = z.object({
  hotspotId: z.string().cuid(),
  txHashHedera: z.string().optional(),
  durationDays: z.number().int().min(1).max(365).default(30),
});

subscriptionsRouter.post('/', requireAuth, validate(createSubscriptionSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSubscriptionSchema>;
    const hotspot = await prisma.hotspot.findUnique({ where: { id: body.hotspotId } });
    if (!hotspot) throw new AppError(404, 'Hotspot not found');
    if (!hotspot.isActive) throw new AppError(400, 'Hotspot is not active');

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + body.durationDays * 86400_000);

    const [subscription, _tx] = await prisma.$transaction([
      prisma.subscription.create({
        data: {
          subscriberAccountId: req.user!.accountId,
          hotspotId: body.hotspotId,
          startsAt,
          expiresAt,
          status: 'ACTIVE',
        },
      }),
      prisma.transaction.create({
        data: {
          type: 'SUBSCRIPTION',
          fromAccount: req.user!.accountId,
          toAccount: null,
          amountHbar: hotspot.monthlyPriceHbar * (body.durationDays / 30),
          txHashHedera: body.txHashHedera ?? null,
          status: body.txHashHedera ? 'SUCCESS' : 'PENDING',
        },
      }),
    ]);

    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { id: req.params['id']! },
      include: { hotspot: { include: { operator: { select: { tier: true, city: true } } } } },
    });
    if (!sub) throw new AppError(404, 'Subscription not found');
    if (sub.subscriberAccountId !== req.user!.accountId && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'Access denied');
    }
    res.json({ success: true, data: sub });
  } catch (err) {
    next(err);
  }
});

subscriptionsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({ where: { id: req.params['id']! } });
    if (!sub) throw new AppError(404, 'Subscription not found');
    if (sub.subscriberAccountId !== req.user!.accountId) throw new AppError(403, 'Not your subscription');

    const updated = await prisma.subscription.update({
      where: { id: req.params['id']! },
      data: { status: 'CANCELLED' },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
