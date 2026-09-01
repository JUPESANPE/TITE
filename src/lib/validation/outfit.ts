import { z } from "zod";

export const OCCASIONS = ["CASUAL", "COMODO", "FORMAL", "ENTRENAMIENTO", "SALIR"] as const;

export const generateOutfitSchema = z.object({
  occasion: z.enum(OCCASIONS),
  city: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  /** ids de generationGroupId ya vistos en esta sesión, para "otra opción" */
  excludeGroupIds: z.array(z.string()).max(20).optional(),
});

export const feedbackSchema = z.object({
  rating: z.enum(["LOVE", "GOOD", "NEUTRAL", "DISLIKE"]),
  comfortable: z.boolean().optional(),
  matchedStyle: z.boolean().optional(),
  wouldRepeat: z.boolean().optional(),
  comment: z.string().trim().max(500).optional(),
});
