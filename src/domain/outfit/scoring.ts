import type { Garment } from "../wardrobe/garment.types";
import type {
  Occasion,
  OutfitFeedbackSignal,
  StylePreferences,
  WeatherContext,
} from "./outfit.types";

const NEUTRAL_COLORS = new Set([
  "negro",
  "blanco",
  "gris",
  "beige",
  "azul marino",
  "crudo",
  "camel",
]);

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Warmth 1-5 que hace falta según la sensación térmica. */
export function neededWarmth(weather: WeatherContext): number {
  const t = weather.feelsLike;
  if (t >= 26) return 1;
  if (t >= 19) return 2;
  if (t >= 12) return 3;
  if (t >= 4) return 4;
  return 5;
}

/** Qué tan bien un item responde al clima de hoy (0-1). */
export function weatherFit(garment: Garment, weather: WeatherContext): number {
  const need = neededWarmth(weather);
  const warmth = garment.warmth ?? 3;
  return clamp01(1 - Math.abs(warmth - need) / 4);
}

const OCCASION_FORMALITY_RANGE: Record<Occasion, [number, number]> = {
  CASUAL: [1, 3],
  COMODO: [1, 2],
  FORMAL: [4, 5],
  ENTRENAMIENTO: [1, 2],
  SALIR: [2, 4],
};

/** Qué tan bien el nivel de formalidad del item calza con la ocasión (0-1). */
export function occasionFit(garment: Garment, occasion: Occasion): number {
  const [min, max] = OCCASION_FORMALITY_RANGE[occasion];
  const formality = garment.formality ?? 2;
  if (formality >= min && formality <= max) return 1;
  const distance = formality < min ? min - formality : formality - max;
  return clamp01(1 - distance / 4);
}

/** Afinidad de estilo entre el item y las preferencias del usuario (0-1, neutral 0.5 sin datos). */
export function styleFit(garment: Garment, preferences: StylePreferences): number {
  if (!garment.styles?.length || !preferences.styles.length) return 0.5;
  const overlap = garment.styles.filter((s) => preferences.styles.includes(s)).length;
  return clamp01(0.5 + overlap / garment.styles.length / 2);
}

/** Preferencia explícita de color/marca del usuario (0-1, neutral 0.5). */
export function preferenceFit(garment: Garment, preferences: StylePreferences): number {
  let score = 0.5;
  const color = garment.primaryColor?.toLowerCase();
  if (color && preferences.favoriteColors.map((c) => c.toLowerCase()).includes(color)) {
    score += 0.25;
  }
  if (color && preferences.avoidedColors.map((c) => c.toLowerCase()).includes(color)) {
    score -= 0.4;
  }
  if (
    garment.brand &&
    preferences.favoriteBrands.map((b) => b.toLowerCase()).includes(garment.brand.toLowerCase())
  ) {
    score += 0.15;
  }
  return clamp01(score);
}

/** Penaliza usar de nuevo algo que se usó muy recientemente (variedad, no limpieza — ver PRODUCT.md punto 21). */
export function recentWearPenalty(garment: Garment, now: Date): number {
  if (!garment.lastWornAt) return 0;
  const days = (now.getTime() - garment.lastWornAt.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 1) return 0.5;
  if (days < 3) return 0.2;
  return 0;
}

/** Armonía de color simple entre las prendas de un outfit (0-1). */
export function colorHarmony(colors: (string | undefined)[]): number {
  const defined = colors.filter((c): c is string => Boolean(c)).map((c) => c.toLowerCase());
  if (defined.length <= 1) return 0.75;
  const neutrals = defined.filter((c) => NEUTRAL_COLORS.has(c));
  const nonNeutrals = defined.filter((c) => !NEUTRAL_COLORS.has(c));
  const distinctNonNeutrals = new Set(nonNeutrals).size;
  if (nonNeutrals.length === 0) return 1; // todo neutro, siempre combina
  if (distinctNonNeutrals <= 1) return 0.9; // un solo color "de color" + neutros
  if (distinctNonNeutrals === 2 && neutrals.length > 0) return 0.6;
  return 0.35; // muchos colores distintos compitiendo
}

/** Evita repetir exactamente la misma combinación ya mostrada (0-1). */
export function varietyScore(garmentIds: string[], excluded: string[][]): number {
  const sorted = [...garmentIds].sort();
  const isRepeat = excluded.some((combo) => {
    const other = [...combo].sort();
    return other.length === sorted.length && other.every((id, i) => id === sorted[i]);
  });
  return isRepeat ? 0 : 1;
}

/** Aprendizaje simple a partir del feedback histórico sobre combinaciones parecidas (0-1, neutral 0.5). */
export function historicalFeedbackFit(
  garmentIds: string[],
  history: OutfitFeedbackSignal[] | undefined,
): number {
  if (!history?.length) return 0.5;
  const relevant = history.filter((h) => h.garmentIds.some((id) => garmentIds.includes(id)));
  if (!relevant.length) return 0.5;
  const avg = relevant.reduce((sum, h) => sum + h.ratingScore, 0) / relevant.length;
  // ratingScore va de -1 a 2 -> normalizamos a 0-1
  return clamp01((avg + 1) / 3);
}
