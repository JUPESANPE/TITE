import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeWardrobeProgress,
  crossedCompletionMilestone,
  hasMinimumViableWardrobe,
} from "../../src/domain/wardrobe/progress";
import type { Garment } from "../../src/domain/wardrobe/garment.types";

function garment(id: string, category: Garment["category"]): Garment {
  return { id, category };
}

test("armario vacío: 0% y no viable", () => {
  const progress = computeWardrobeProgress([]);
  assert.equal(progress.percentage, 0);
  assert.equal(progress.minimumViable, false);
});

test("mínimo viable: 2 tops + 2 bottoms + 1 calzado alcanza para el primer outfit", () => {
  const wardrobe = [
    garment("1", "REMERAS"),
    garment("2", "CAMISAS"),
    garment("3", "PANTALONES"),
    garment("4", "SHORTS"),
    garment("5", "ZAPATILLAS"),
  ];
  assert.equal(hasMinimumViableWardrobe(wardrobe), true);
});

test("faltando calzado no es viable aunque haya tops y bottoms", () => {
  const wardrobe = [garment("1", "REMERAS"), garment("2", "CAMISAS"), garment("3", "PANTALONES"), garment("4", "SHORTS")];
  assert.equal(hasMinimumViableWardrobe(wardrobe), false);
});

test("crossedCompletionMilestone detecta cruce de 25% pero no reporta dos veces", () => {
  assert.equal(crossedCompletionMilestone(20, 30), 25);
  assert.equal(crossedCompletionMilestone(26, 30), null);
});

test("crossedCompletionMilestone detecta el mayor hito cruzado de una sola vez", () => {
  assert.equal(crossedCompletionMilestone(10, 80), 75);
});
