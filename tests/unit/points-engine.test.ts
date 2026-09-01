import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLedgerEntry, dailyReferenceId, UnknownPointsAmountError } from "../../src/domain/points/points-engine";

test("arma una entrada de ledger con el monto default de la tabla", () => {
  const entry = buildLedgerEntry("GARMENT_ADDED", { referenceId: "item-1", source: "wardrobe" });
  assert.equal(entry.amount, 5);
  assert.equal(entry.actionType, "GARMENT_ADDED");
  assert.equal(entry.referenceId, "item-1");
});

test("permite override explícito de monto (para STREAK_MILESTONE / MANUAL_ADJUSTMENT)", () => {
  const entry = buildLedgerEntry("STREAK_MILESTONE", { referenceId: "7", source: "streak", amount: 30 });
  assert.equal(entry.amount, 30);
});

test("lanza si no hay monto default ni override", () => {
  assert.throws(
    () => buildLedgerEntry("MANUAL_ADJUSTMENT", { referenceId: "x", source: "support" }),
    UnknownPointsAmountError,
  );
});

test("dailyReferenceId es estable dentro del mismo día UTC y cambia al día siguiente", () => {
  const a = dailyReferenceId(new Date("2026-06-15T08:00:00Z"));
  const b = dailyReferenceId(new Date("2026-06-15T23:00:00Z"));
  const c = dailyReferenceId(new Date("2026-06-16T01:00:00Z"));
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("dos GARMENT_ADDED con distinta referenceId no colisionan (cada prenda es su propia referencia)", () => {
  const e1 = buildLedgerEntry("GARMENT_ADDED", { referenceId: "item-1", source: "wardrobe" });
  const e2 = buildLedgerEntry("GARMENT_ADDED", { referenceId: "item-2", source: "wardrobe" });
  assert.notEqual(e1.referenceId, e2.referenceId);
});
