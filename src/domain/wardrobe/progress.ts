import type { Garment, GarmentCategory } from "./garment.types";

/**
 * Progressive wardrobe building (punto 22-24): no exigimos cargar 50-100
 * prendas antes de usar TITE. Definimos un mínimo viable y un objetivo por
 * categoría para el % de progreso gamificado.
 */
export const CATEGORY_TARGETS: Partial<Record<GarmentCategory, number>> = {
  REMERAS: 5,
  CAMISAS: 2,
  BUZOS: 2,
  SWEATERS: 2,
  CAMPERAS: 2,
  PANTALONES: 3,
  SHORTS: 2,
  ZAPATILLAS: 2,
  ZAPATOS: 1,
  ACCESORIOS: 2,
};

export const MIN_VIABLE = {
  tops: 2,
  bottoms: 2,
  footwear: 1,
};

const TOP_CATEGORIES: GarmentCategory[] = ["REMERAS", "CAMISAS", "BUZOS", "SWEATERS"];
const BOTTOM_CATEGORIES: GarmentCategory[] = ["PANTALONES", "SHORTS", "FALDAS"];
const FOOTWEAR_CATEGORIES: GarmentCategory[] = ["ZAPATILLAS", "ZAPATOS"];

function countByCategory(wardrobe: Garment[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of wardrobe) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }
  return counts;
}

function countIn(wardrobe: Garment[], categories: GarmentCategory[]): number {
  return wardrobe.filter((item) => categories.includes(item.category)).length;
}

/** ¿Ya alcanza para armar el primer outfit? (punto 24) */
export function hasMinimumViableWardrobe(wardrobe: Garment[]): boolean {
  return (
    countIn(wardrobe, TOP_CATEGORIES) >= MIN_VIABLE.tops &&
    countIn(wardrobe, BOTTOM_CATEGORIES) >= MIN_VIABLE.bottoms &&
    countIn(wardrobe, FOOTWEAR_CATEGORIES) >= MIN_VIABLE.footwear
  );
}

export interface WardrobeProgress {
  /** 0-100 */
  percentage: number;
  byCategory: Partial<Record<GarmentCategory, { count: number; target: number; complete: boolean }>>;
  minimumViable: boolean;
}

/** % de armario completo (punto 23), en base a targets por categoría clave. */
export function computeWardrobeProgress(wardrobe: Garment[]): WardrobeProgress {
  const counts = countByCategory(wardrobe);
  const categories = Object.keys(CATEGORY_TARGETS) as GarmentCategory[];

  const byCategory: WardrobeProgress["byCategory"] = {};
  let sumRatio = 0;

  for (const category of categories) {
    const target = CATEGORY_TARGETS[category]!;
    const count = counts[category] ?? 0;
    const ratio = Math.min(1, count / target);
    sumRatio += ratio;
    byCategory[category] = { count, target, complete: ratio >= 1 };
  }

  const percentage = Math.round((sumRatio / categories.length) * 100);

  return { percentage, byCategory, minimumViable: hasMinimumViableWardrobe(wardrobe) };
}

/** Umbrales que disparan Points por completitud de armario (punto 43, categoría ARMARIO). */
export function crossedCompletionMilestone(
  previousPercentage: number,
  newPercentage: number,
): 25 | 50 | 75 | 100 | null {
  const milestones = [100, 75, 50, 25] as const;
  for (const m of milestones) {
    if (previousPercentage < m && newPercentage >= m) return m;
  }
  return null;
}
