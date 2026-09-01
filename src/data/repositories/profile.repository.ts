import { prisma } from "@/data/prisma";
import { computeProfileCompleteness } from "@/domain/profile/completeness";

export async function getProfile(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function upsertOnboarding(
  userId: string,
  data: {
    name: string;
    city: string;
    latitude?: number;
    longitude?: number;
    stylePreferences: string[];
    sizes?: Record<string, string | undefined>;
  },
) {
  await prisma.user.update({ where: { id: userId }, data: { name: data.name } });

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      stylePreferences: data.stylePreferences,
      sizes: data.sizes,
      onboardingCompletedAt: new Date(),
    },
    update: {
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      stylePreferences: data.stylePreferences,
      sizes: data.sizes,
      onboardingCompletedAt: new Date(),
    },
  });

  return recomputeCompleteness(userId, profile);
}

export async function updatePreferences(
  userId: string,
  data: Partial<{
    favoriteColors: string[];
    avoidedColors: string[];
    favoriteBrands: string[];
    fitPreference: string;
    budgetLevel: string;
    comfortVsAesthetic: number;
  }>,
) {
  const profile = await prisma.profile.update({ where: { userId }, data });
  return recomputeCompleteness(userId, profile);
}

async function recomputeCompleteness(userId: string, profile: { id: string }) {
  const current = await prisma.profile.findUniqueOrThrow({ where: { userId } });
  const completeness = computeProfileCompleteness(current);
  if (completeness !== current.profileCompleteness) {
    return prisma.profile.update({
      where: { userId },
      data: { profileCompleteness: completeness },
    });
  }
  return current;
}

export async function setConsent(userId: string, type: string, granted: boolean) {
  return prisma.userConsent.upsert({
    where: { userId_type: { userId, type: type as never } },
    create: { userId, type: type as never, granted },
    update: { granted },
  });
}

export async function listConsents(userId: string) {
  return prisma.userConsent.findMany({ where: { userId } });
}
