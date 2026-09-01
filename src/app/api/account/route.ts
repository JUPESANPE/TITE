import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/data/prisma";

/**
 * Borrar cuenta (punto 61). El cascade delete del schema (DATA_MODEL.md)
 * se encarga de borrar armario, outfits, points, analytics y consentimientos
 * asociados — no hace falta borrarlos a mano acá.
 */
export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
