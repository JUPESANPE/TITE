import type { Garment, OutfitItemRole } from "../wardrobe/garment.types";
import { CATEGORY_TO_ROLE } from "../wardrobe/garment.types";
import type { OutfitCandidate, OutfitCandidateItem, OutfitEngineInput } from "./outfit.types";
import {
  colorHarmony,
  historicalFeedbackFit,
  neededWarmth,
  occasionFit,
  preferenceFit,
  recentWearPenalty,
  styleFit,
  varietyScore,
  weatherFit,
} from "./scoring";

/**
 * TITE nunca inventa ropa: el engine sólo combina prendas que existen
 * realmente en `input.wardrobe`. Si no hay suficientes categorías para
 * armar ni un outfit mínimo, se lanza OutfitEngineError en vez de devolver
 * una combinación inventada o vacía silenciosamente (ver PRODUCT.md punto 65).
 */
export class OutfitEngineError extends Error {
  constructor(public missingCategories: OutfitItemRole[]) {
    super(`No hay prendas suficientes para armar un outfit. Falta: ${missingCategories.join(", ")}`);
    this.name = "OutfitEngineError";
  }
}

// Clima y ocasión son restricciones objetivas del día; estilo/preferencia
// personalizan dentro de lo que ya es apropiado para hoy (punto 32: reglas
// de clima/ocasión priman sobre el ajuste fino de estilo).
const ITEM_WEIGHTS = {
  weather: 0.45,
  occasion: 0.2,
  style: 0.15,
  preference: 0.2,
};

const COMBO_WEIGHTS = {
  itemAverage: 0.6,
  colorHarmony: 0.2,
  variety: 0.1,
  history: 0.1,
};

const TOP_K_PER_ROLE = 4;

function groupByRole(wardrobe: Garment[]): Partial<Record<OutfitItemRole, Garment[]>> {
  const groups: Partial<Record<OutfitItemRole, Garment[]>> = {};
  for (const garment of wardrobe) {
    const role = CATEGORY_TO_ROLE[garment.category];
    if (!role) continue; // OTROS no participa del engine
    (groups[role] ??= []).push(garment);
  }
  return groups;
}

function itemScore(garment: Garment, input: OutfitEngineInput, now: Date): number {
  const w = weatherFit(garment, input.weather);
  const o = occasionFit(garment, input.occasion);
  const s = styleFit(garment, input.preferences);
  const p = preferenceFit(garment, input.preferences);
  const penalty = recentWearPenalty(garment, now);
  const base =
    w * ITEM_WEIGHTS.weather +
    o * ITEM_WEIGHTS.occasion +
    s * ITEM_WEIGHTS.style +
    p * ITEM_WEIGHTS.preference;
  return Math.max(0, base - penalty * 0.15);
}

function topByScore(garments: Garment[] | undefined, input: OutfitEngineInput, now: Date, k: number): Garment[] {
  if (!garments?.length) return [];
  return [...garments]
    .sort((a, b) => itemScore(b, input, now) - itemScore(a, input, now))
    .slice(0, k);
}

function buildSkeletons(groups: Partial<Record<OutfitItemRole, Garment[]>>): {
  base: OutfitItemRole[];
  needsOuterwear: boolean;
} | null {
  const hasFootwear = Boolean(groups.FOOTWEAR?.length);
  const hasDress = Boolean(groups.DRESS?.length);
  const hasTopBottom = Boolean(groups.TOP?.length) && Boolean(groups.BOTTOM?.length);

  if (!hasFootwear) return null;
  if (hasDress) return { base: ["DRESS", "FOOTWEAR"], needsOuterwear: true };
  if (hasTopBottom) return { base: ["TOP", "BOTTOM", "FOOTWEAR"], needsOuterwear: true };
  return null;
}

function missingCategories(groups: Partial<Record<OutfitItemRole, Garment[]>>): OutfitItemRole[] {
  const missing: OutfitItemRole[] = [];
  if (!groups.FOOTWEAR?.length) missing.push("FOOTWEAR");
  const hasDress = Boolean(groups.DRESS?.length);
  const hasTopBottom = Boolean(groups.TOP?.length) && Boolean(groups.BOTTOM?.length);
  if (!hasDress && !hasTopBottom) {
    if (!groups.TOP?.length) missing.push("TOP");
    if (!groups.BOTTOM?.length) missing.push("BOTTOM");
  }
  return missing;
}

function comboSignature(items: OutfitCandidateItem[]): string[] {
  return items.map((i) => i.garment.id).sort();
}

function scoreCombo(
  items: OutfitCandidateItem[],
  input: OutfitEngineInput,
  now: Date,
): { score: number; breakdown: Record<string, number> } {
  const garments = items.map((i) => i.garment);
  const itemAvg =
    garments.reduce((sum, g) => sum + itemScore(g, input, now), 0) / garments.length;
  const colors = colorHarmony(garments.map((g) => g.primaryColor));
  const ids = garments.map((g) => g.id);
  const variety = varietyScore(ids, input.excludedCombinations ?? []);
  const history = historicalFeedbackFit(ids, input.feedbackHistory);

  const score =
    itemAvg * COMBO_WEIGHTS.itemAverage +
    colors * COMBO_WEIGHTS.colorHarmony +
    variety * COMBO_WEIGHTS.variety +
    history * COMBO_WEIGHTS.history;

  return { score, breakdown: { itemAvg, colors, variety, history } };
}

function explain(items: OutfitCandidateItem[], input: OutfitEngineInput): string {
  const occasionCopy: Record<string, string> = {
    CASUAL: "un día casual",
    COMODO: "estar cómodo",
    FORMAL: "una ocasión formal",
    ENTRENAMIENTO: "entrenar",
    SALIR: "salir",
  };
  const temp = Math.round(input.weather.feelsLike);
  const stylesInCombo = new Set(items.flatMap((i) => i.garment.styles ?? []));
  const matchedStyle = input.preferences.styles.find((s) => stylesInCombo.has(s));
  const stylePart = matchedStyle
    ? ` y combina con el estilo ${matchedStyle.toLowerCase()} que venís eligiendo`
    : "";
  return `Va bien para los ${temp}° de hoy, pensado para ${occasionCopy[input.occasion]}${stylePart}.`;
}

function buildCombos(
  skeleton: OutfitItemRole[],
  groups: Partial<Record<OutfitItemRole, Garment[]>>,
  input: OutfitEngineInput,
  now: Date,
  includeOuterwear: boolean,
): OutfitCandidateItem[][] {
  const roleOptions = skeleton.map((role) => ({
    role,
    options: topByScore(groups[role], input, now, TOP_K_PER_ROLE),
  }));

  if (includeOuterwear && neededWarmth(input.weather) >= 4 && groups.OUTERWEAR?.length) {
    roleOptions.push({ role: "OUTERWEAR", options: topByScore(groups.OUTERWEAR, input, now, 2) });
  }

  let combos: OutfitCandidateItem[][] = [[]];
  for (const { role, options } of roleOptions) {
    if (!options.length) continue;
    const next: OutfitCandidateItem[][] = [];
    for (const combo of combos) {
      for (const garment of options) {
        next.push([...combo, { garment, role }]);
      }
    }
    combos = next;
  }
  return combos;
}

/**
 * Genera hasta `count` outfits reales, ordenados por score, evitando
 * repetir exactamente combinaciones ya mostradas (`excludedCombinations`).
 */
export function generateOutfits(input: OutfitEngineInput, count = 2): OutfitCandidate[] {
  const now = input.now ?? new Date();
  const groups = groupByRole(input.wardrobe);
  const skeleton = buildSkeletons(groups);

  if (!skeleton) {
    throw new OutfitEngineError(missingCategories(groups));
  }

  const combos = buildCombos(skeleton.base, groups, input, now, skeleton.needsOuterwear);

  const scored: OutfitCandidate[] = combos.map((items) => {
    const { score, breakdown } = scoreCombo(items, input, now);
    return { items, score, explanation: explain(items, input), scoreBreakdown: breakdown };
  });

  const seen = new Set<string>();
  const excludedSignatures = new Set(
    (input.excludedCombinations ?? []).map((c) => [...c].sort().join("|")),
  );

  const unique = scored
    .sort((a, b) => b.score - a.score)
    .filter((candidate) => {
      const sig = comboSignature(candidate.items).join("|");
      if (seen.has(sig) || excludedSignatures.has(sig)) return false;
      seen.add(sig);
      return true;
    });

  return unique.slice(0, count);
}

/** Pide una alternativa distinta a las ya mostradas. Lanza si no queda ninguna. */
export function generateAlternative(
  input: OutfitEngineInput,
  alreadyShown: string[][],
): OutfitCandidate {
  const [next] = generateOutfits({ ...input, excludedCombinations: alreadyShown }, 1);
  if (!next) {
    throw new OutfitEngineError(missingCategories(groupByRole(input.wardrobe)));
  }
  return next;
}
