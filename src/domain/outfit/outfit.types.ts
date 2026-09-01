import type { Garment, OutfitItemRole } from "../wardrobe/garment.types";

export type Occasion = "CASUAL" | "COMODO" | "FORMAL" | "ENTRENAMIENTO" | "SALIR";

export interface WeatherContext {
  temp: number;
  feelsLike: number;
  rainChance: number;
  windSpeed: number;
}

export interface StylePreferences {
  styles: string[];
  favoriteColors: string[];
  avoidedColors: string[];
  favoriteBrands: string[];
}

export interface OutfitFeedbackSignal {
  /** ids de las prendas que componían un outfit pasado */
  garmentIds: string[];
  /** 2 = LOVE, 1 = GOOD, 0 = NEUTRAL, -1 = DISLIKE (ver POINTS_SYSTEM/DATA_MODEL) */
  ratingScore: number;
}

export interface OutfitEngineInput {
  wardrobe: Garment[];
  weather: WeatherContext;
  occasion: Occasion;
  preferences: StylePreferences;
  /** combinaciones (por ids de prenda, ordenados) ya mostradas en esta sesión — para "otra opción" */
  excludedCombinations?: string[][];
  feedbackHistory?: OutfitFeedbackSignal[];
  now?: Date;
}

export interface OutfitCandidateItem {
  garment: Garment;
  role: OutfitItemRole;
}

export interface OutfitCandidate {
  items: OutfitCandidateItem[];
  score: number;
  explanation: string;
  scoreBreakdown: Record<string, number>;
}
