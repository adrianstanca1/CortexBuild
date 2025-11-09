import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import type { Tenant, User } from '@prisma/client';

const TOKEN_TTL = '1d';

type JwtPayload = {
  userId: string;
  tenantId: string;
  role: string;
};

function createToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export async function registerAccount(input: {
  tenantName: string;
  tenantSlug: string;
  fullName: string;
  email: string;
  password: string;
  plan: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.tenantName,
        slug: input.tenantSlug,
        plan: input.plan
      }
    });

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        passwordHash,
        role: 'super_admin'
      }
    });

    return { tenant, user };
  });

  const token = createToken({
    userId: result.user.id,
    tenantId: result.tenant.id,
    role: result.user.role
  });

  return { token, tenant: result.tenant, user: result.user };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { tenant: true }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const token = createToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
  return { token, user };
}

export function toSafeUser(user: User & { tenant?: Tenant }) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return toSafeUser(user);
}
