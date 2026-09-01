import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { listFavorites } from "@/data/repositories/outfit.repository";

export async function GET() {
  try {
    const user = await requireUser();
    const favorites = await listFavorites(user.id);
    return NextResponse.json({ favorites });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
