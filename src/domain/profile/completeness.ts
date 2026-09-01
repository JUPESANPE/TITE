/**
 * "TITE te conoce: XX%" (punto 15). Representa completitud del perfil de
 * estilo — nunca información privada invasiva. Cada campo suma lo mismo;
 * ir agregando micropreguntas (P1) simplemente agrega entradas acá.
 */
interface ProfileLike {
  city?: string | null;
  stylePreferences?: string[];
  sizes?: unknown;
  favoriteColors?: string[];
  avoidedColors?: string[];
  favoriteBrands?: string[];
  fitPreference?: string | null;
  budgetLevel?: string | null;
  comfortVsAesthetic?: number | null;
}

const WEIGHTED_FIELDS: Array<(p: ProfileLike) => boolean> = [
  (p) => Boolean(p.city),
  (p) => Boolean(p.stylePreferences?.length),
  (p) => Boolean(p.sizes),
  (p) => Boolean(p.favoriteColors?.length),
  (p) => Boolean(p.avoidedColors?.length),
  (p) => Boolean(p.favoriteBrands?.length),
  (p) => Boolean(p.fitPreference),
  (p) => Boolean(p.budgetLevel),
  (p) => p.comfortVsAesthetic !== null && p.comfortVsAesthetic !== undefined,
];

export function computeProfileCompleteness(profile: ProfileLike): number {
  const filled = WEIGHTED_FIELDS.filter((check) => check(profile)).length;
  return Math.round((filled / WEIGHTED_FIELDS.length) * 100);
}
