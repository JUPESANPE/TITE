import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { createWardrobeItemSchema, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validation/wardrobe";
import { sniffImageType } from "@/lib/image-sniff";
import { storageService } from "@/services/storage";
import { garmentClassificationService } from "@/ai";
import { createWardrobeItem, listWardrobe } from "@/data/repositories/wardrobe.repository";
import { awardPoints } from "@/data/repositories/points.repository";
import { buildLedgerEntry } from "@/domain/points/points-engine";
import { computeWardrobeProgress, crossedCompletionMilestone } from "@/domain/wardrobe/progress";
import type { Garment, GarmentCategory } from "@/domain/wardrobe/garment.types";
import { track } from "@/analytics/analytics.service";

function toGarment(item: { id: string; category: GarmentCategory }): Garment {
  return { id: item.id, category: item.category };
}

export async function GET() {
  try {
    const user = await requireUser();
    const items = await listWardrobe(user.id);
    const progress = computeWardrobeProgress(items.map(toGarment));
    return NextResponse.json({ items, progress });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

/**
 * Sube una foto y crea la prenda (punto 17-20). Multipart: `image` (File) +
 * `category` opcional (si el usuario ya la eligió al sacar la foto).
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("image");
    const categoryHint = form.get("category");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "La imagen es demasiado grande (máx 8MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const realType = sniffImageType(buffer);
    if (!realType || !ACCEPTED_IMAGE_TYPES.includes(realType)) {
      return NextResponse.json({ error: "El archivo no es una imagen JPEG/PNG/WebP válida" }, { status: 415 });
    }

    const parsedHint = createWardrobeItemSchema.shape.category.optional().safeParse(categoryHint);
    const hint = parsedHint.success ? parsedHint.data : undefined;

    const classification = await garmentClassificationService.classify({
      imageBuffer: buffer,
      contentType: realType,
      categoryHint: hint,
    });

    const extension = realType === "image/png" ? "png" : realType === "image/webp" ? "webp" : "jpg";
    const { url } = await storageService.upload({
      key: `${user.id}/${randomUUID()}.${extension}`,
      data: buffer,
      contentType: realType,
    });

    const before = await listWardrobe(user.id);
    const progressBefore = computeWardrobeProgress(before.map(toGarment)).percentage;

    const item = await createWardrobeItem(user.id, {
      imageUrl: url,
      category: classification.category,
      subcategory: classification.subcategory,
      primaryColor: classification.primaryColor,
      secondaryColors: classification.secondaryColors,
      warmth: classification.warmth,
      formality: classification.formality,
      fit: classification.fit,
      styles: classification.styles,
      aiClassified: true,
    });

    const progressAfter = computeWardrobeProgress([...before.map(toGarment), toGarment(item)]).percentage;
    const milestone = crossedCompletionMilestone(progressBefore, progressAfter);

    if (before.length === 0) {
      await awardPoints(user.id, buildLedgerEntry("FIRST_GARMENT_ADDED", { referenceId: "first-garment", source: "wardrobe" }));
    } else {
      await awardPoints(user.id, buildLedgerEntry("GARMENT_ADDED", { referenceId: item.id, source: "wardrobe" }));
    }
    if (milestone) {
      const actionType =
        milestone === 100
          ? "WARDROBE_100_COMPLETED"
          : milestone === 75
            ? "CATEGORY_75_COMPLETED"
            : milestone === 50
              ? "CATEGORY_50_COMPLETED"
              : "CATEGORY_25_COMPLETED";
      await awardPoints(user.id, buildLedgerEntry(actionType, { referenceId: `wardrobe-${milestone}`, source: "wardrobe" }));
    }

    await track("wardrobe_item_added", user.id, { category: item.category, aiConfidence: classification.confidence });

    return NextResponse.json({ item, progress: progressAfter, milestone }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
