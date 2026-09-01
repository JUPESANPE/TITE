import { Prisma } from "@prisma/client";
import { prisma } from "@/data/prisma";
import type { LedgerEntryDraft } from "@/domain/points/points.types";
import { computeStreakUpdate, streakMilestoneAmount, type StreakState } from "@/domain/points/streaks";
import { buildLedgerEntry } from "@/domain/points/points-engine";

const UNIQUE_VIOLATION = "P2002";

/**
 * Inserta en el ledger y actualiza el balance en una sola transacción. Si la
 * combinación (userId, actionType, referenceId) ya existe, el constraint
 * único de la DB rechaza el insert (anti-farming — DATA_MODEL.md) y acá lo
 * tratamos como "no-op", no como error: la acción simplemente ya había sido
 * premiada antes.
 */
export async function awardPoints(
  userId: string,
  entry: LedgerEntryDraft,
): Promise<{ awarded: boolean; amount: number }> {
  try {
    await prisma.$transaction([
      prisma.pointsLedgerEntry.create({
        data: {
          userId,
          amount: entry.amount,
          actionType: entry.actionType as never,
          source: entry.source,
          referenceId: entry.referenceId,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        },
      }),
      prisma.pointsBalance.upsert({
        where: { userId },
        create: { userId, total: entry.amount },
        update: { total: { increment: entry.amount } },
      }),
    ]);
    return { awarded: true, amount: entry.amount };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION) {
      return { awarded: false, amount: 0 };
    }
    throw error;
  }
}

export async function getBalance(userId: string): Promise<number> {
  const balance = await prisma.pointsBalance.findUnique({ where: { userId } });
  return balance?.total ?? 0;
}

export async function getLedgerHistory(userId: string, limit = 50) {
  return prisma.pointsLedgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

function toStreakState(row: { currentCount: number; longestCount: number; lastActionDate: Date | null }): StreakState {
  return {
    currentCount: row.currentCount,
    longestCount: row.longestCount,
    lastActionDate: row.lastActionDate ? row.lastActionDate.toISOString().slice(0, 10) : null,
  };
}

/**
 * Registra la acción significativa del día (seleccionar/confirmar outfit —
 * punto 47) y devuelve el nuevo estado de racha + si se acreditaron Points
 * de hito. Idempotente: si ya se registró hoy, no vuelve a sumar racha.
 */
export async function registerStreakAction(userId: string, actionDate: Date) {
  const existing = await prisma.streak.findUnique({ where: { userId } });
  const current = existing
    ? toStreakState(existing)
    : { currentCount: 0, longestCount: 0, lastActionDate: null };

  const { next, milestoneReached, alreadyCountedToday } = computeStreakUpdate(current, actionDate);

  if (alreadyCountedToday) {
    return { streak: current, milestoneReached: null as number | null, pointsAwarded: 0 };
  }

  await prisma.streak.upsert({
    where: { userId },
    create: {
      userId,
      currentCount: next.currentCount,
      longestCount: next.longestCount,
      lastActionDate: next.lastActionDate,
    },
    update: {
      currentCount: next.currentCount,
      longestCount: next.longestCount,
      lastActionDate: next.lastActionDate,
    },
  });

  let pointsAwarded = 0;
  if (milestoneReached) {
    const entry = buildLedgerEntry("STREAK_MILESTONE", {
      referenceId: `streak-${milestoneReached}`,
      source: "streak",
      amount: streakMilestoneAmount(milestoneReached),
    });
    const result = await awardPoints(userId, entry);
    pointsAwarded = result.amount;
  }

  return { streak: next, milestoneReached, pointsAwarded };
}

export async function getStreak(userId: string): Promise<StreakState> {
  const row = await prisma.streak.findUnique({ where: { userId } });
  return row ? toStreakState(row) : { currentCount: 0, longestCount: 0, lastActionDate: null };
}
