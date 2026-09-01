import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { getOutfit, selectOutfit } from "@/data/repositories/outfit.repository";
import { markWorn } from "@/data/repositories/wardrobe.repository";
import { registerStreakAction } from "@/data/repositories/points.repository";
import { buildLedgerEntry, dailyReferenceId } from "@/domain/points/points-engine";
import { awardPoints } from "@/data/repositories/points.repository";
import { track } from "@/analytics/analytics.service";

interface Params {
  params: Promise<{ id: string }>;
}

/** "Me pongo este" (punto 37): registra elección, alimenta racha y aprendizaje futuro. */
export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const outfit = await getOutfit(user.id, id);
    if (!outfit) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const updated = await selectOutfit(user.id, id);
    if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const now = new Date();
    const garmentIds = outfit.items.map((i) => i.wardrobeItemId).filter((gid): gid is string => Boolean(gid));
    await markWorn(user.id, garmentIds, now);

    await awardPoints(
      user.id,
      buildLedgerEntry("OUTFIT_SELECTED", { referenceId: dailyReferenceId(now), source: "daily_use" }),
    );
    const { streak, milestoneReached, pointsAwarded } = await registerStreakAction(user.id, now);

    await track("outfit_selected", user.id, { occasion: outfit.occasion });
    await track("outfit_used", user.id, { occasion: outfit.occasion });
    if (milestoneReached) await track("streak_updated", user.id, { milestone: milestoneReached });

    return NextResponse.json({ streak, milestoneReached, streakPointsAwarded: pointsAwarded });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
