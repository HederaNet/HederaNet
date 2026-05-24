import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

export const energyRouter: Router = Router();

// ─── GET /energy/installations — all active solar installations for map ────────

energyRouter.get('/installations', async (_req, res, next) => {
  try {
    const installations = await prisma.solarInstallation.findMany({
      where: { isActive: true },
      include: {
        operator: { select: { city: true, country: true, tier: true, hederaAccountId: true } },
        listings: { where: { isActive: true }, select: { pricePerKwhHbar: true, availableUnits: true } },
      },
    });
    res.json({ success: true, data: installations });
  } catch (err) {
    next(err);
  }
});

const listingsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

energyRouter.get('/listings', validateQuery(listingsQuerySchema), async (req, res, next) => {
  try {
    const q = req.query as unknown as z.infer<typeof listingsQuerySchema>;
    const skip = (q.page - 1) * q.limit;

    const [listings, total] = await Promise.all([
      prisma.energyListing.findMany({
        where: { isActive: true },
        include: { installation: { include: { operator: { select: { tier: true, city: true, reputationScore: true } } } } },
        skip,
        take: q.limit,
        orderBy: { pricePerKwhHbar: 'asc' },
      }),
      prisma.energyListing.count({ where: { isActive: true } }),
    ]);

    res.json({ success: true, data: listings, pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } });
  } catch (err) {
    next(err);
  }
});

const createListingSchema = z.object({
  installationId: z.string().cuid(),
  pricePerKwhHbar: z.number().positive(),
  availableUnits: z.number().positive(),
});

energyRouter.post('/listings', requireAuth, requireRole('OPERATOR', 'ADMIN'), validate(createListingSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createListingSchema>;
    const installation = await prisma.solarInstallation.findUnique({ where: { id: body.installationId }, include: { operator: true } });
    if (!installation) throw new AppError(404, 'Solar installation not found');
    if (installation.operator.hederaAccountId !== req.user!.accountId) throw new AppError(403, 'Not your installation');

    const listing = await prisma.energyListing.create({ data: body });
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
});

energyRouter.put('/listings/:id', requireAuth, async (req, res, next) => {
  try {
    const listing = await prisma.energyListing.findUnique({
      where: { id: req.params['id']! },
      include: { installation: { include: { operator: true } } },
    });
    if (!listing) throw new AppError(404, 'Listing not found');
    if (listing.installation.operator.hederaAccountId !== req.user!.accountId) throw new AppError(403, 'Not your listing');

    const updated = await prisma.energyListing.update({
      where: { id: req.params['id']! },
      data: req.body as Record<string, unknown>,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

const tradeSchema = z.object({
  listingId: z.string().cuid(),
  units: z.number().positive(),
  txHashHedera: z.string().optional(),
});

const createSolarInstallationSchema = z.object({
  capacityKw: z.number().positive(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

energyRouter.post('/solar-installation', requireAuth, requireRole('OPERATOR', 'ADMIN'), validate(createSolarInstallationSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSolarInstallationSchema>;
    const operator = await prisma.operator.findUnique({ where: { hederaAccountId: req.user!.accountId } });
    if (!operator) throw new AppError(400, 'Not registered as operator');

    const installation = await prisma.solarInstallation.create({
      data: {
        operatorId: operator.id,
        capacityKw: body.capacityKw,
        lat: body.lat,
        lng: body.lng,
        hcsTopicId: `topic.${Date.now()}`,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: installation });
  } catch (err) {
    next(err);
  }
});

energyRouter.post('/trade', requireAuth, validate(tradeSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof tradeSchema>;
    const listing = await prisma.energyListing.findUnique({
      where: { id: body.listingId },
      include: { installation: { include: { operator: true } } },
    });
    if (!listing) throw new AppError(404, 'Listing not found');
    if (!listing.isActive) throw new AppError(400, 'Listing is not active');
    if (body.units > listing.availableUnits) throw new AppError(400, 'Insufficient available units');

    const totalHbar = body.units * listing.pricePerKwhHbar;

    const [trade] = await prisma.$transaction([
      prisma.energyTrade.create({
        data: {
          listingId: body.listingId,
          buyerAccountId: req.user!.accountId,
          sellerAccountId: listing.installation.operator.hederaAccountId,
          units: body.units,
          totalHbar,
          contractTradeId: body.txHashHedera ?? null,
          status: 'PENDING',
        },
      }),
      prisma.energyListing.update({
        where: { id: body.listingId },
        data: { availableUnits: { decrement: body.units } },
      }),
      prisma.transaction.create({
        data: {
          type: 'ENERGY_TRADE',
          fromAccount: req.user!.accountId,
          toAccount: listing.installation.operator.hederaAccountId,
          amountHbar: totalHbar,
          txHashHedera: body.txHashHedera ?? null,
          status: body.txHashHedera ? 'SUCCESS' : 'PENDING',
        },
      }),
    ]);

    res.status(201).json({ success: true, data: trade });
  } catch (err) {
    next(err);
  }
});
