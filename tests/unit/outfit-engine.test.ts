import { test } from "node:test";
import assert from "node:assert/strict";
import { generateOutfits, generateAlternative, OutfitEngineError } from "../../src/domain/outfit/outfit-engine";
import type { Garment } from "../../src/domain/wardrobe/garment.types";
import type { OutfitEngineInput } from "../../src/domain/outfit/outfit.types";

function garment(overrides: Partial<Garment> & Pick<Garment, "id" | "category">): Garment {
  return { warmth: 3, formality: 2, styles: [], secondaryColors: [], ...overrides };
}

function basePreferences() {
  return { styles: ["Casual"], favoriteColors: [], avoidedColors: [], favoriteBrands: [] };
}

function baseInput(overrides: Partial<OutfitEngineInput> = {}): OutfitEngineInput {
  const wardrobe: Garment[] = [
    garment({ id: "top-1", category: "REMERAS", primaryColor: "blanco", warmth: 1, formality: 1, styles: ["Casual"] }),
    garment({ id: "top-2", category: "CAMISAS", primaryColor: "azul marino", warmth: 2, formality: 3, styles: ["Clásico"] }),
    garment({ id: "bottom-1", category: "PANTALONES", primaryColor: "negro", warmth: 2, formality: 2, styles: ["Casual"] }),
    garment({ id: "bottom-2", category: "SHORTS", primaryColor: "beige", warmth: 1, formality: 1, styles: ["Casual"] }),
    garment({ id: "shoe-1", category: "ZAPATILLAS", primaryColor: "blanco", warmth: 2, formality: 1, styles: ["Casual"] }),
    garment({ id: "shoe-2", category: "ZAPATOS", primaryColor: "negro", warmth: 2, formality: 4, styles: ["Clásico"] }),
  ];
  return {
    wardrobe,
    weather: { temp: 22, feelsLike: 22, rainChance: 10, windSpeed: 10 },
    occasion: "CASUAL",
    preferences: basePreferences(),
    now: new Date("2026-06-15T12:00:00Z"),
    ...overrides,
  };
}

test("nunca inventa prendas: todo item devuelto existe en el armario de entrada", () => {
  const input = baseInput();
  const [outfit] = generateOutfits(input, 1);
  const wardrobeIds = new Set(input.wardrobe.map((g) => g.id));
  for (const item of outfit.items) {
    assert.ok(wardrobeIds.has(item.garment.id), `${item.garment.id} no pertenece al armario`);
  }
});

test("devuelve exactamente 2 outfits cuando se piden 2 y hay variedad suficiente", () => {
  const outfits = generateOutfits(baseInput(), 2);
  assert.equal(outfits.length, 2);
});

test("un outfit siempre tiene calzado y (top+bottom) o vestido", () => {
  const [outfit] = generateOutfits(baseInput(), 1);
  const roles = outfit.items.map((i) => i.role);
  assert.ok(roles.includes("FOOTWEAR"));
  const hasDress = roles.includes("DRESS");
  const hasTopBottom = roles.includes("TOP") && roles.includes("BOTTOM");
  assert.ok(hasDress || hasTopBottom);
});

test("lanza OutfitEngineError explicando qué categoría falta si no hay calzado", () => {
  const input = baseInput({
    wardrobe: baseInput().wardrobe.filter((g) => g.category !== "ZAPATILLAS" && g.category !== "ZAPATOS"),
  });
  assert.throws(() => generateOutfits(input, 2), (err: Error) => {
    assert.ok(err instanceof OutfitEngineError);
    assert.ok((err as OutfitEngineError).missingCategories.includes("FOOTWEAR"));
    return true;
  });
});

test("clima frío prioriza prendas más abrigadas", () => {
  const input = baseInput({ weather: { temp: -2, feelsLike: -2, rainChance: 0, windSpeed: 5 } });
  const [outfit] = generateOutfits(input, 1);
  const top = outfit.items.find((i) => i.role === "TOP")!.garment;
  assert.equal(top.id, "top-2"); // el más abrigado de los dos tops
});

test("ocasión formal prioriza prendas más formales", () => {
  const input = baseInput({ occasion: "FORMAL" });
  const [outfit] = generateOutfits(input, 1);
  const shoe = outfit.items.find((i) => i.role === "FOOTWEAR")!.garment;
  assert.equal(shoe.id, "shoe-2"); // el zapato más formal
});

test("otra opción no repite exactamente la combinación anterior", () => {
  const input = baseInput();
  const [first] = generateOutfits(input, 1);
  const firstIds = first.items.map((i) => i.garment.id).sort();
  const alternative = generateAlternative(input, [firstIds]);
  const altIds = alternative.items.map((i) => i.garment.id).sort();
  assert.notDeepEqual(altIds, firstIds);
});

test("historial de feedback negativo baja el score de una combinación repetida", () => {
  const input = baseInput();
  const withoutHistory = generateOutfits(input, 1)[0];
  const ids = withoutHistory.items.map((i) => i.garment.id);
  const withHistory = generateOutfits(
    { ...input, feedbackHistory: [{ garmentIds: ids, ratingScore: -1 }] },
    1,
  )[0];
  assert.ok(withHistory.scoreBreakdown.history! < withoutHistory.scoreBreakdown.history!);
});
