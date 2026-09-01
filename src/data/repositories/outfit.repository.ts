import { prisma } from "@/data/prisma";
import type { OutfitCandidate } from "@/domain/outfit/outfit.types";
import type { WeatherReading } from "@/services/weather/weather-service";

export async function saveWeatherSnapshot(city: string, weather: WeatherReading) {
  return prisma.weatherSnapshot.create({
    data: {
      city,
      temp: weather.temp,
      feelsLike: weather.feelsLike,
      tempMin: weather.tempMin,
      tempMax: weather.tempMax,
      rainChance: weather.rainChance,
      windSpeed: weather.windSpeed,
      condition: weather.condition,
      provider: weather.provider,
    },
  });
}

/** Combinaciones (arrays de wardrobeItemId) ya generadas para esta ocasión hoy — para "otra opción". */
export async function getRecentCombinations(userId: string, sinceHoursAgo = 20): Promise<string[][]> {
  const since = new Date(Date.now() - sinceHoursAgo * 60 * 60 * 1000);
  const outfits = await prisma.outfit.findMany({
    where: { userId, createdAt: { gte: since } },
    include: { items: { select: { wardrobeItemId: true } } },
  });
  return outfits.map((o) => o.items.map((i) => i.wardrobeItemId).filter((id): id is string => Boolean(id)));
}

export async function persistGeneratedOutfits(
  userId: string,
  occasion: string,
  weatherSnapshotId: string,
  generationGroupId: string,
  candidates: OutfitCandidate[],
) {
  const created = [];
  for (const candidate of candidates) {
    const outfit = await prisma.outfit.create({
      data: {
        userId,
        occasion: occasion as never,
        weatherSnapshotId,
        generationGroupId,
        explanation: candidate.explanation,
        score: candidate.score,
        items: {
          create: candidate.items.map((item) => ({
            wardrobeItemId: item.garment.id,
            role: item.role as never,
            garmentSnapshot: {
              category: item.garment.category,
              primaryColor: item.garment.primaryColor ?? null,
            },
          })),
        },
      },
      include: { items: { include: { wardrobeItem: true } }, weatherSnapshot: true },
    });
    created.push(outfit);
  }
  return created;
}

export async function getOutfit(userId: string, id: string) {
  return prisma.outfit.findFirst({
    where: { id, userId },
    include: { items: { include: { wardrobeItem: true } }, weatherSnapshot: true, feedback: true },
  });
}

export async function selectOutfit(userId: string, id: string) {
  const result = await prisma.outfit.updateMany({
    where: { id, userId },
    data: { status: "SELECTED", selectedAt: new Date() },
  });
  return result.count > 0;
}

export async function addFeedback(
  userId: string,
  outfitId: string,
  data: {
    rating: string;
    comfortable?: boolean;
    matchedStyle?: boolean;
    wouldRepeat?: boolean;
    comment?: string;
  },
) {
  const outfit = await prisma.outfit.findFirst({ where: { id: outfitId, userId } });
  if (!outfit) return null;
  return prisma.outfitFeedback.upsert({
    where: { outfitId },
    create: { outfitId, ...data, rating: data.rating as never },
    update: { ...data, rating: data.rating as never },
  });
}

export async function toggleFavorite(userId: string, outfitId: string): Promise<boolean> {
  const outfit = await prisma.outfit.findFirst({ where: { id: outfitId, userId } });
  if (!outfit) throw new Error("Outfit no encontrado o no pertenece al usuario");

  const existing = await prisma.favoriteOutfit.findUnique({
    where: { userId_outfitId: { userId, outfitId } },
  });
  if (existing) {
    await prisma.favoriteOutfit.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.favoriteOutfit.create({ data: { userId, outfitId } });
  return true;
}

export async function listFavorites(userId: string) {
  const favorites = await prisma.favoriteOutfit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { outfit: { include: { items: { include: { wardrobeItem: true } } } } },
  });
  // Punto 38: si alguna prenda ya no existe, se avisa en vez de romper el outfit.
  return favorites.map((fav) => ({
    ...fav,
    outfit: {
      ...fav.outfit,
      hasRemovedGarments: fav.outfit.items.some((item) => !item.wardrobeItem),
    },
  }));
}

export async function getFeedbackHistory(userId: string, limit = 100) {
  const feedback = await prisma.outfitFeedback.findMany({
    where: { outfit: { userId } },
    include: { outfit: { include: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  const ratingScore: Record<string, number> = { LOVE: 2, GOOD: 1, NEUTRAL: 0, DISLIKE: -1 };
  return feedback.map((f) => ({
    garmentIds: f.outfit.items.map((i) => i.wardrobeItemId).filter((id): id is string => Boolean(id)),
    ratingScore: ratingScore[f.rating] ?? 0,
  }));
}
