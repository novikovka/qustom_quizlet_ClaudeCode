import argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

export type PublicUser = { id: number; email: string };

export class EmailTakenError extends Error {}

const publicFields = { id: true, email: true } as const;

export async function registerUser(email: string, password: string): Promise<PublicUser> {
  const passwordHash = await argon2.hash(password);
  try {
    return await prisma.user.create({ data: { email, passwordHash }, select: publicFields });
  } catch (err) {
    // P2002 — нарушение уникальности: такой email уже есть
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new EmailTakenError();
    }
    throw err;
  }
}

// Возвращает пользователя, если email и пароль верны, иначе null
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await argon2.verify(user.passwordHash, password))) {
    return null;
  }
  return { id: user.id, email: user.email };
}

export function findUserById(id: number): Promise<PublicUser | null> {
  return prisma.user.findUnique({ where: { id }, select: publicFields });
}
