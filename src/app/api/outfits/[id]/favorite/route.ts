import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { toggleFavorite } from "@/data/repositories/outfit.repository";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const favorited = await toggleFavorite(user.id, id);
    return NextResponse.json({ favorited });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
