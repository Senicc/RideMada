import type { Prisma } from '@prisma/client';
import prisma from '../config/db';

export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string,
  details?: Record<string, unknown>,
) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetId: targetId ?? null,
        details: details as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error('[AdminLog]', error);
  }
}
