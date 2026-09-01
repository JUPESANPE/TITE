import { z } from "zod";

export const GARMENT_CATEGORIES = [
  "REMERAS",
  "CAMISAS",
  "BUZOS",
  "SWEATERS",
  "CAMPERAS",
  "PANTALONES",
  "SHORTS",
  "VESTIDOS",
  "FALDAS",
  "ZAPATILLAS",
  "ZAPATOS",
  "ACCESORIOS",
  "OTROS",
] as const;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — punto 20, límite razonable

export const createWardrobeItemSchema = z.object({
  category: z.enum(GARMENT_CATEGORIES),
  name: z.string().trim().max(80).optional(),
  subcategory: z.string().trim().max(60).optional(),
  primaryColor: z.string().trim().max(40).optional(),
  secondaryColors: z.array(z.string().trim().max(40)).max(5).optional(),
  brand: z.string().trim().max(60).optional(),
  warmth: z.number().int().min(1).max(5).optional(),
  formality: z.number().int().min(1).max(5).optional(),
  fit: z.string().trim().max(40).optional(),
  styles: z.array(z.string().trim().max(40)).max(10).optional(),
  season: z.array(z.string().trim().max(20)).max(4).optional(),
  material: z.string().trim().max(60).optional(),
  price: z.number().min(0).max(10_000_000).optional(),
});

export const updateWardrobeItemSchema = createWardrobeItemSchema.partial().extend({
  favorite: z.boolean().optional(),
});
