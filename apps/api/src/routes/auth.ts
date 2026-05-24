import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, issueToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createHederaAccount } from '@hederanet/hedera-sdk';
import { encrypt } from '../lib/crypto.js';
import type { ApiResponse } from '@hederanet/types';
import type { User } from '@prisma/client';

export const authRouter: Router = Router();

type SafeUser = Omit<User, 'passwordHash' | 'hederaPrivateKey'>;

function sanitize(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _p, hederaPrivateKey: _k, ...safe } = user;
  return safe;
}

async function provisionAccount(): Promise<{ accountId: string; publicKeyHex: string; privateKeyEncrypted: string }> {
  const account = await createHederaAccount();
  return {
    accountId: account.accountId,
    publicKeyHex: account.publicKeyHex,
    privateKeyEncrypted: encrypt(account.privateKeyHex),
  };
}

// ─── Email / Password sign-up ────────────────────────────────────────────────

const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
});

authRouter.post('/signup', validate(signUpSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof signUpSchema>;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'An account with this email already exists');

    const [passwordHash, hedera] = await Promise.all([
      bcrypt.hash(password, 12),
      provisionAccount(),
    ]);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        hederaAccountId: hedera.accountId,
        hederaPublicKey: hedera.publicKeyHex,
        hederaPrivateKey: hedera.privateKeyEncrypted,
        role: 'SUBSCRIBER',
        kycStatus: 'PENDING',
      },
    });

    const token = issueToken({ userId: user.id, accountId: user.hederaAccountId, role: user.role });
    const response: ApiResponse<{ token: string; user: SafeUser }> = {
      success: true,
      data: { token, user: sanitize(user) },
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// ─── Email / Password sign-in ────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});

authRouter.post('/signin', validate(signInSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof signInSchema>;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new AppError(401, 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid email or password');

    const token = issueToken({ userId: user.id, accountId: user.hederaAccountId, role: user.role });
    const response: ApiResponse<{ token: string; user: SafeUser }> = {
      success: true,
      data: { token, user: sanitize(user) },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

const googleSchema = z.object({
  accessToken: z.string().min(1),
});

authRouter.post('/google', validate(googleSchema), async (req, res, next) => {
  try {
    const { accessToken } = req.body as z.infer<typeof googleSchema>;

    // Verify the access token and fetch user info from Google
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userinfoRes.ok) throw new AppError(401, 'Invalid Google access token');

    const payload = await userinfoRes.json() as {
      sub: string;
      email: string;
      name?: string;
      given_name?: string;
      email_verified: boolean | string;
    };

    if (payload.email_verified !== true && payload.email_verified !== 'true') {
      throw new AppError(401, 'Google email is not verified');
    }

    const { sub: googleId, email, name, given_name } = payload;
    const displayName = name ?? given_name ?? email.split('@')[0]!;

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (!user) {
      const hedera = await provisionAccount();
      user = await prisma.user.create({
        data: {
          email,
          name: displayName,
          googleId,
          hederaAccountId: hedera.accountId,
          hederaPublicKey: hedera.publicKeyHex,
          hederaPrivateKey: hedera.privateKeyEncrypted,
          role: 'SUBSCRIBER',
          kycStatus: 'PENDING',
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, name: user.name ?? displayName },
      });
    }

    const token = issueToken({ userId: user.id, accountId: user.hederaAccountId, role: user.role });
    const response: ApiResponse<{ token: string; user: SafeUser }> = {
      success: true,
      data: { token, user: sanitize(user) },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── Current user ─────────────────────────────────────────────────────────────

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { operator: true },
    });

    if (!user) throw new AppError(404, 'User not found');
    res.json({ success: true, data: { ...sanitize(user), operator: user.operator } });
  } catch (err) {
    next(err);
  }
});

// ─── Update profile ───────────────────────────────────────────────────────────

const AVATAR_MAX_BYTES = 300_000; // ~220KB image after base64

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').optional(),
  avatarUrl: z.string()
    .refine((v) => v.startsWith('data:image/'), 'Avatar must be a valid image data URL')
    .refine((v) => v.length <= AVATAR_MAX_BYTES, 'Image is too large (max ~220KB)')
    .nullable()
    .optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .optional(),
}).refine(
  (d) => !(d.newPassword && !d.currentPassword),
  { message: 'Current password is required to set a new password', path: ['currentPassword'] },
);

authRouter.patch('/me', requireAuth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof updateProfileSchema>;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError(404, 'User not found');

    // Verify current password before allowing password change
    if (body.newPassword) {
      if (!user.passwordHash) throw new AppError(400, 'Password change not available for Google accounts');
      const valid = await bcrypt.compare(body.currentPassword!, user.passwordHash);
      if (!valid) throw new AppError(401, 'Current password is incorrect');
    }

    // Check email uniqueness if changing
    if (body.email && body.email !== user.email) {
      const taken = await prisma.user.findUnique({ where: { email: body.email } });
      if (taken) throw new AppError(409, 'Email is already in use');
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...('avatarUrl' in body && { avatarUrl: body.avatarUrl ?? null }),
        ...(body.newPassword && { passwordHash: await bcrypt.hash(body.newPassword, 12) }),
      },
    });

    const response: ApiResponse<SafeUser> = { success: true, data: sanitize(updated) };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export type { SafeUser };
