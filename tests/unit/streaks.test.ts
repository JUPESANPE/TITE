import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStreakUpdate, streakMilestoneAmount, type StreakState } from "../../src/domain/points/streaks";

const empty: StreakState = { currentCount: 0, longestCount: 0, lastActionDate: null };

test("primera acción arranca la racha en 1", () => {
  const { next, milestoneReached, alreadyCountedToday } = computeStreakUpdate(empty, new Date("2026-06-15T10:00:00Z"));
  assert.equal(next.currentCount, 1);
  assert.equal(alreadyCountedToday, false);
  assert.equal(milestoneReached, null);
});

test("acción el mismo día no incrementa la racha (anti-farming)", () => {
  const state: StreakState = { currentCount: 1, longestCount: 1, lastActionDate: "2026-06-15" };
  const { next, alreadyCountedToday } = computeStreakUpdate(state, new Date("2026-06-15T22:00:00Z"));
  assert.equal(next.currentCount, 1);
  assert.equal(alreadyCountedToday, true);
});

test("acción al día siguiente incrementa la racha", () => {
  const state: StreakState = { currentCount: 2, longestCount: 2, lastActionDate: "2026-06-15" };
  const { next } = computeStreakUpdate(state, new Date("2026-06-16T10:00:00Z"));
  assert.equal(next.currentCount, 3);
  assert.equal(next.longestCount, 3);
});

test("saltearse un día resetea la racha a 1, pero conserva el récord (longestCount)", () => {
  const state: StreakState = { currentCount: 6, longestCount: 6, lastActionDate: "2026-06-15" };
  const { next } = computeStreakUpdate(state, new Date("2026-06-17T10:00:00Z"));
  assert.equal(next.currentCount, 1);
  assert.equal(next.longestCount, 6);
});

test("detecta el hito de 3 y 7 días", () => {
  let state: StreakState = { currentCount: 2, longestCount: 2, lastActionDate: "2026-06-14" };
  const day3 = computeStreakUpdate(state, new Date("2026-06-15T10:00:00Z"));
  assert.equal(day3.milestoneReached, 3);

  state = { currentCount: 6, longestCount: 6, lastActionDate: "2026-06-14" };
  const day7 = computeStreakUpdate(state, new Date("2026-06-15T10:00:00Z"));
  assert.equal(day7.milestoneReached, 7);
});

test("montos de hitos crecen con el hito", () => {
  assert.equal(streakMilestoneAmount(3), 15);
  assert.equal(streakMilestoneAmount(7), 30);
  assert.equal(streakMilestoneAmount(14), 60);
  assert.equal(streakMilestoneAmount(30), 150);
  assert.ok(streakMilestoneAmount(60) > 0);
});
