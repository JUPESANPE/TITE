import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { updateWardrobeItemSchema } from "@/lib/validation/wardrobe";
import {
  deleteWardrobeItem,
  getWardrobeItem,
  updateWardrobeItem,
} from "@/data/repositories/wardrobe.repository";
import { storageService } from "@/services/storage";
import { track } from "@/analytics/analytics.service";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await getWardrobeItem(user.id, id);
    if (!item) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = updateWardrobeItemSchema.parse(await req.json());
    // Cualquier corrección manual del usuario cuenta como confirmación (punto 18).
    const updated = await updateWardrobeItem(user.id, id, { ...body, aiConfirmed: true });
    if (!updated) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    const item = await getWardrobeItem(user.id, id);
    return NextResponse.json({ item });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const item = await getWardrobeItem(user.id, id);
    if (!item) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const deleted = await deleteWardrobeItem(user.id, id);
    if (!deleted) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const key = item.imageUrl.replace("/api/uploads/", "");
    await storageService.delete(key);
    await track("wardrobe_item_deleted", user.id, { category: item.category });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
