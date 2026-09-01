import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { feedbackSchema } from "@/lib/validation/outfit";
import { addFeedback } from "@/data/repositories/outfit.repository";
import { awardPoints } from "@/data/repositories/points.repository";
import { buildLedgerEntry } from "@/domain/points/points-engine";
import { track } from "@/analytics/analytics.service";

interface Params {
  params: Promise<{ id: string }>;
}

/** "¿Cómo te sentiste con este look?" (punto 39) — alimenta el aprendizaje futuro. */
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = feedbackSchema.parse(await req.json());

    const feedback = await addFeedback(user.id, id, body);
    if (!feedback) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // Un feedback por outfit: referenceId=outfitId hace que sólo se premie una vez (anti-farming).
    await awardPoints(
      user.id,
      buildLedgerEntry("OUTFIT_FEEDBACK_GIVEN", { referenceId: id, source: "feedback" }),
    );
    await track("outfit_feedback_submitted", user.id, { rating: body.rating });

    return NextResponse.json({ feedback });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
