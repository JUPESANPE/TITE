export type PointsActionType =
  | "ACCOUNT_CREATED"
  | "ONBOARDING_COMPLETED"
  | "PROFILE_COMPLETED"
  | "STYLE_PREFERENCES_SET"
  | "SIZES_SET"
  | "MICRO_QUESTION_ANSWERED"
  | "FIRST_GARMENT_ADDED"
  | "GARMENT_ADDED"
  | "CATEGORY_25_COMPLETED"
  | "CATEGORY_50_COMPLETED"
  | "CATEGORY_75_COMPLETED"
  | "WARDROBE_100_COMPLETED"
  | "OUTFIT_GENERATED"
  | "OUTFIT_SELECTED"
  | "OUTFIT_FEEDBACK_GIVEN"
  | "STREAK_MILESTONE"
  | "MANUAL_ADJUSTMENT";

export interface LedgerEntryDraft {
  amount: number;
  actionType: PointsActionType;
  source: string;
  /** Junto con userId + actionType, es la clave de idempotencia (ver DATA_MODEL.md). */
  referenceId: string;
  metadata?: Record<string, unknown>;
}
