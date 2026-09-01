import { Prisma } from "@prisma/client";
import { prisma } from "@/data/prisma";
import type { AnalyticsEventName } from "./events";

/**
 * Nunca manda PII en `properties` (punto 57): sólo ids y valores de
 * producto (categoría, ocasión, rating, etc). No falla el flujo principal
 * si el tracking falla — analytics es best-effort.
 */
export async function track(
  name: AnalyticsEventName,
  userId: string | null,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: { name, userId, properties: properties as Prisma.InputJsonValue | undefined },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("analytics track failed", name, error);
  }
}
