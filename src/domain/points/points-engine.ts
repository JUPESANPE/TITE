import type { LedgerEntryDraft, PointsActionType } from "./points.types";

/**
 * Montos de P0 (punto 44 del brief: sólo las acciones que el MVP necesita).
 * El resto de las categorías del punto 43 quedan reservadas en el enum de
 * Prisma pero sin trigger todavía — se activan en P1+ (ver ROADMAP.md).
 */
export const POINTS_TABLE: Partial<Record<PointsActionType, number>> = {
  ACCOUNT_CREATED: 20,
  ONBOARDING_COMPLETED: 30,
  PROFILE_COMPLETED: 20,
  STYLE_PREFERENCES_SET: 10,
  SIZES_SET: 10,
  MICRO_QUESTION_ANSWERED: 5,
  FIRST_GARMENT_ADDED: 15,
  GARMENT_ADDED: 5,
  CATEGORY_25_COMPLETED: 10,
  CATEGORY_50_COMPLETED: 20,
  CATEGORY_75_COMPLETED: 20,
  WARDROBE_100_COMPLETED: 100,
  OUTFIT_GENERATED: 2,
  OUTFIT_SELECTED: 5,
  OUTFIT_FEEDBACK_GIVEN: 5,
};

export class UnknownPointsAmountError extends Error {
  constructor(actionType: PointsActionType) {
    super(
      `No hay un monto por defecto para "${actionType}". Pasá "amount" explícito (ej: STREAK_MILESTONE, MANUAL_ADJUSTMENT).`,
    );
    this.name = "UnknownPointsAmountError";
  }
}

/**
 * Construye la entrada que se va a insertar en points_ledger. Es una función
 * pura: no toca la base de datos ni decide si la acción ya fue premiada
 * antes — eso lo garantiza el constraint único (userId, actionType,
 * referenceId) al insertar (ver DATA_MODEL.md, anti-farming punto 46).
 */
export function buildLedgerEntry(
  actionType: PointsActionType,
  opts: {
    referenceId: string;
    source: string;
    amount?: number;
    metadata?: Record<string, unknown>;
  },
): LedgerEntryDraft {
  const amount = opts.amount ?? POINTS_TABLE[actionType];
  if (amount === undefined) {
    throw new UnknownPointsAmountError(actionType);
  }
  return {
    amount,
    actionType,
    referenceId: opts.referenceId,
    source: opts.source,
    metadata: opts.metadata,
  };
}

/** Referencia de idempotencia para acciones que sólo deben premiarse una vez por día (punto 46). */
export function dailyReferenceId(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}
