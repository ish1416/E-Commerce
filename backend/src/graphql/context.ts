import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { verifyToken } from '../services/auth';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  userId: string | null;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const userId = token ? verifyToken(token) : null;
  return { prisma, userId };
}
