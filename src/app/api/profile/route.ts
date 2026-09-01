import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { onboardingSchema, profilePreferencesSchema } from "@/lib/validation/profile";
import { getProfile, updatePreferences, upsertOnboarding } from "@/data/repositories/profile.repository";
import { buildLedgerEntry } from "@/domain/points/points-engine";
import { awardPoints } from "@/data/repositories/points.repository";
import { track } from "@/analytics/analytics.service";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getProfile(user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

/** Completa el onboarding (punto 12): corto y progresivo, no 40 preguntas. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = onboardingSchema.parse(await req.json());

    const wasCompletedBefore = Boolean((await getProfile(user.id))?.onboardingCompletedAt);
    const profile = await upsertOnboarding(user.id, body);

    if (!wasCompletedBefore) {
      await awardPoints(
        user.id,
        buildLedgerEntry("ONBOARDING_COMPLETED", { referenceId: "onboarding", source: "onboarding" }),
      );
      await awardPoints(
        user.id,
        buildLedgerEntry("STYLE_PREFERENCES_SET", { referenceId: "onboarding-styles", source: "onboarding" }),
      );
      await track("onboarding_completed", user.id, { stylesCount: body.stylePreferences.length });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

/** Preferencias ampliadas, post-onboarding (punto 14 — no todo es obligatorio al principio). */
export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = profilePreferencesSchema.parse(await req.json());
    const profile = await updatePreferences(user.id, body);
    await track("profile_updated", user.id, { fields: Object.keys(body) });
    return NextResponse.json({ profile });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
