export interface StreakState {
  currentCount: number;
  longestCount: number;
  /** Fecha (no timestamp) en formato YYYY-MM-DD, para no contar dos veces el mismo día (punto 47). */
  lastActionDate: string | null;
}

export const STREAK_MILESTONES = [3, 7, 14, 30] as const;

const MILESTONE_AMOUNTS: Record<number, number> = { 3: 15, 7: 30, 14: 60, 30: 150 };

/** Puntos de un hito de racha; los hitos por encima de 30 usan un monto genérico. */
export function streakMilestoneAmount(milestone: number): number {
  return MILESTONE_AMOUNTS[milestone] ?? 50;
}

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / msPerDay);
}

export interface StreakUpdateResult {
  next: StreakState;
  /** Hito alcanzado con esta actualización, si corresponde. */
  milestoneReached: number | null;
  /** true si la acción de hoy ya se había contado (no cambia el estado, evita farming — punto 47). */
  alreadyCountedToday: boolean;
}

/**
 * La racha se mantiene con una acción significativa (seleccionar/confirmar
 * el outfit del día), nunca sólo por abrir la app (punto 47). Función pura:
 * recibe el estado actual y la fecha de la acción, devuelve el nuevo estado.
 */
export function computeStreakUpdate(state: StreakState, actionDate: Date): StreakUpdateResult {
  const today = toDateOnly(actionDate);

  if (state.lastActionDate === today) {
    return { next: state, milestoneReached: null, alreadyCountedToday: true };
  }

  const diff = state.lastActionDate ? daysBetween(state.lastActionDate, today) : null;
  const continuesStreak = diff === 1;
  const currentCount = continuesStreak ? state.currentCount + 1 : 1;
  const longestCount = Math.max(state.longestCount, currentCount);

  const milestoneReached = (STREAK_MILESTONES as readonly number[]).includes(currentCount)
    ? currentCount
    : null;

  return {
    next: { currentCount, longestCount, lastActionDate: today },
    milestoneReached,
    alreadyCountedToday: false,
  };
}
