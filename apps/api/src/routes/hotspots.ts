import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

export const hotspotsRouter: Router = Router();

const spatialQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(500).default(50),
  minUptime: z.coerce.number().min(0).max(100).optional(),
  maxPriceHbar: z.coerce.number().positive().optional(),
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Haversine-based bounding box filter (approximate, fast)
function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

hotspotsRouter.get('/', validateQuery(spatialQuerySchema), async (req, res, next) => {
  try {
    const q = req.query as unknown as z.infer<typeof spatialQuerySchema>;
    const { minLat, maxLat, minLng, maxLng } = getBoundingBox(q.lat, q.lng, q.radiusKm);

    const skip = (q.page - 1) * q.limit;

    const where = {
      isActive: true,
      lat: { gte: minLat, lte: maxLat },
      lng: { gte: minLng, lte: maxLng },
      ...(q.minUptime ? { uptimePct30d: { gte: q.minUptime } } : {}),
      ...(q.maxPriceHbar ? { monthlyPriceHbar: { lte: q.maxPriceHbar } } : {}),
      ...(q.tier ? { operator: { tier: q.tier } } : {}),
    };

    const [hotspots, total] = await Promise.all([
      prisma.hotspot.findMany({
        where,
        include: { operator: { select: { tier: true, hederaAccountId: true, reputationScore: true, country: true, city: true } } },
        skip,
        take: q.limit,
        orderBy: { uptimePct30d: 'desc' },
      }),
      prisma.hotspot.count({ where }),
    ]);

    res.json({
      success: true,
      data: hotspots,
      pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
    });
  } catch (err) {
    next(err);
  }
});

hotspotsRouter.get('/:id', async (req, res, next) => {
  try {
    const hotspot = await prisma.hotspot.findUnique({
      where: { id: req.params['id']! },
      include: {
        operator: true,
        subscriptions: { where: { status: 'ACTIVE' }, select: { id: true } },
      },
    });

    if (!hotspot) throw new AppError(404, 'Hotspot not found');
    res.json({ success: true, data: { ...hotspot, activeSubscriptions: hotspot.subscriptions.length } });
  } catch (err) {
    next(err);
  }
});

const createHotspotSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  coverageRadiusMeters: z.number().int().min(50).max(5000),
  monthlyPriceHbar: z.number().positive(),
});

hotspotsRouter.post('/', requireAuth, requireRole('OPERATOR', 'ADMIN'), validate(createHotspotSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createHotspotSchema>;
    const operator = await prisma.operator.findUnique({ where: { hederaAccountId: req.user!.accountId } });
    if (!operator) throw new AppError(400, 'You must be a registered operator');

    // Generate a unique HCS topic ID placeholder (real deployment would create HCS topic)
    const hcsTopicId = `${Date.now()}.${Math.random().toString(36).slice(2)}`;

    const hotspot = await prisma.hotspot.create({
      data: { ...body, operatorId: operator.id, hcsTopicId },
    });

    res.status(201).json({ success: true, data: hotspot });
  } catch (err) {
    next(err);
  }
});

hotspotsRouter.put('/:id', requireAuth, requireRole('OPERATOR', 'ADMIN'), async (req, res, next) => {
  try {
    const hotspot = await prisma.hotspot.findUnique({ where: { id: req.params['id']! }, include: { operator: true } });
    if (!hotspot) throw new AppError(404, 'Hotspot not found');
    if (hotspot.operator.hederaAccountId !== req.user!.accountId) throw new AppError(403, 'Not your hotspot');

    const updated = await prisma.hotspot.update({
      where: { id: req.params['id']! },
      data: req.body as Record<string, unknown>,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
