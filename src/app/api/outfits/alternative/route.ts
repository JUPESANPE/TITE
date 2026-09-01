import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { OCCASIONS } from "@/lib/validation/outfit";
import { resolveUserWeather } from "@/lib/resolve-weather";
import { getProfile } from "@/data/repositories/profile.repository";
import { listWardrobe } from "@/data/repositories/wardrobe.repository";
import {
  getFeedbackHistory,
  getRecentCombinations,
  persistGeneratedOutfits,
  saveWeatherSnapshot,
} from "@/data/repositories/outfit.repository";
import { prisma } from "@/data/prisma";
import { generateAlternative } from "@/domain/outfit/outfit-engine";
import { buildLedgerEntry } from "@/domain/points/points-engine";
import { awardPoints } from "@/data/repositories/points.repository";
import { track } from "@/analytics/analytics.service";
import type { Garment } from "@/domain/wardrobe/garment.types";

const schema = z.object({
  occasion: z.enum(OCCASIONS),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  /** ids de outfits ya mostrados en esta sesión que no se deben repetir. */
  excludeOutfitIds: z.array(z.string()).min(1),
});

/** "Otra opción" (punto 35): una alternativa real, sin repetir lo ya mostrado. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    const shownOutfits = await prisma.outfit.findMany({
      where: { id: { in: body.excludeOutfitIds }, userId: user.id },
      include: { items: true },
    });
    const shownCombinations = shownOutfits.map((o) =>
      o.items.map((i) => i.wardrobeItemId).filter((id): id is string => Boolean(id)),
    );

    const [profile, wardrobeRows, weather, recentCombinations, feedbackHistory] = await Promise.all([
      getProfile(user.id),
      listWardrobe(user.id),
      resolveUserWeather(user.id, { city: body.city, latitude: body.latitude, longitude: body.longitude }),
      getRecentCombinations(user.id),
      getFeedbackHistory(user.id),
    ]);

    const wardrobe: Garment[] = wardrobeRows.map((w) => ({
      id: w.id,
      category: w.category,
      primaryColor: w.primaryColor ?? undefined,
      secondaryColors: w.secondaryColors,
      brand: w.brand ?? undefined,
      warmth: w.warmth ?? undefined,
      formality: w.formality ?? undefined,
      styles: w.styles,
      lastWornAt: w.lastWornAt,
      favorite: w.favorite,
    }));

    const alternative = generateAlternative(
      {
        wardrobe,
        weather,
        occasion: body.occasion,
        preferences: {
          styles: profile?.stylePreferences ?? [],
          favoriteColors: profile?.favoriteColors ?? [],
          avoidedColors: profile?.avoidedColors ?? [],
          favoriteBrands: profile?.favoriteBrands ?? [],
        },
        feedbackHistory,
      },
      [...recentCombinations, ...shownCombinations],
    );

    const weatherSnapshot = await saveWeatherSnapshot(profile?.city ?? weather.city, weather);
    const [outfit] = await persistGeneratedOutfits(
      user.id,
      body.occasion,
      weatherSnapshot.id,
      randomUUID(),
      [alternative],
    );

    await track("alternate_outfit_requested", user.id, { occasion: body.occasion });

    return NextResponse.json({ outfit });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
