import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { consentSchema } from "@/lib/validation/profile";
import { listConsents, setConsent } from "@/data/repositories/profile.repository";

/** Consentimiento granular (punto 61): ubicación, analytics, personalización, marketing, data sharing. */
export async function GET() {
  try {
    const user = await requireUser();
    const consents = await listConsents(user.id);
    return NextResponse.json({ consents });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = consentSchema.parse(await req.json());
    const consent = await setConsent(user.id, body.type, body.granted);
    return NextResponse.json({ consent });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
