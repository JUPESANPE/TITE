import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { generateOutfitSchema } from "@/lib/validation/outfit";
import { resolveUserWeather } from "@/lib/resolve-weather";
import { getProfile } from "@/data/repositories/profile.repository";
import { listWardrobe } from "@/data/repositories/wardrobe.repository";
import {
  getFeedbackHistory,
  getRecentCombinations,
  persistGeneratedOutfits,
  saveWeatherSnapshot,
} from "@/data/repositories/outfit.repository";
import { generateOutfits } from "@/domain/outfit/outfit-engine";
import { buildLedgerEntry, dailyReferenceId } from "@/domain/points/points-engine";
import { awardPoints } from "@/data/repositories/points.repository";
import { track } from "@/analytics/analytics.service";
import type { Garment } from "@/domain/wardrobe/garment.types";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = generateOutfitSchema.parse(await req.json());

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

    const candidates = generateOutfits(
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
        excludedCombinations: recentCombinations,
        feedbackHistory,
      },
      2,
    );

    const weatherSnapshot = await saveWeatherSnapshot(profile?.city ?? weather.city, weather);
    const generationGroupId = randomUUID();
    const outfits = await persistGeneratedOutfits(
      user.id,
      body.occasion,
      weatherSnapshot.id,
      generationGroupId,
      candidates,
    );

    await awardPoints(
      user.id,
      buildLedgerEntry("OUTFIT_GENERATED", { referenceId: dailyReferenceId(new Date()), source: "daily_use" }),
    );
    await track("outfit_generated", user.id, { occasion: body.occasion, count: outfits.length });

    return NextResponse.json({ outfits, generationGroupId });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
