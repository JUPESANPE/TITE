import { z } from "zod";

export const STYLE_OPTIONS = [
  "Casual",
  "Streetwear",
  "Clásico",
  "Formal",
  "Deportivo",
  "Minimalista",
  "Elegante",
  "Urbano",
] as const;

export const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  stylePreferences: z.array(z.enum(STYLE_OPTIONS)).min(1, "Elegí al menos un estilo"),
  sizes: z
    .object({
      tops: z.string().max(20).optional(),
      bottoms: z.string().max(20).optional(),
      shoes: z.string().max(20).optional(),
    })
    .optional(),
});

export const profilePreferencesSchema = z.object({
  favoriteColors: z.array(z.string().max(40)).max(20).optional(),
  avoidedColors: z.array(z.string().max(40)).max(20).optional(),
  favoriteBrands: z.array(z.string().max(60)).max(20).optional(),
  fitPreference: z.enum(["oversize", "regular", "slim"]).optional(),
  budgetLevel: z.enum(["bajo", "medio", "alto"]).optional(),
  comfortVsAesthetic: z.number().min(0).max(100).optional(),
});

export const consentSchema = z.object({
  type: z.enum(["LOCATION", "ANALYTICS", "PERSONALIZATION", "MARKETING", "DATA_SHARING"]),
  granted: z.boolean(),
});
