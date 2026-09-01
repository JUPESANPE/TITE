export type GarmentCategory =
  | "REMERAS"
  | "CAMISAS"
  | "BUZOS"
  | "SWEATERS"
  | "CAMPERAS"
  | "PANTALONES"
  | "SHORTS"
  | "VESTIDOS"
  | "FALDAS"
  | "ZAPATILLAS"
  | "ZAPATOS"
  | "ACCESORIOS"
  | "OTROS";

export type OutfitItemRole =
  | "TOP"
  | "BOTTOM"
  | "FOOTWEAR"
  | "OUTERWEAR"
  | "ACCESSORY"
  | "DRESS";

/** A qué rol de outfit corresponde cada categoría de prenda. `OTROS` no participa del engine. */
export const CATEGORY_TO_ROLE: Partial<Record<GarmentCategory, OutfitItemRole>> = {
  REMERAS: "TOP",
  CAMISAS: "TOP",
  BUZOS: "TOP",
  SWEATERS: "TOP",
  CAMPERAS: "OUTERWEAR",
  PANTALONES: "BOTTOM",
  SHORTS: "BOTTOM",
  FALDAS: "BOTTOM",
  VESTIDOS: "DRESS",
  ZAPATILLAS: "FOOTWEAR",
  ZAPATOS: "FOOTWEAR",
  ACCESORIOS: "ACCESSORY",
};

export interface Garment {
  id: string;
  category: GarmentCategory;
  primaryColor?: string;
  secondaryColors?: string[];
  brand?: string;
  /** 1 (liviano) a 5 (muy abrigado) */
  warmth?: number;
  /** 1 (informal) a 5 (formal) */
  formality?: number;
  styles?: string[];
  lastWornAt?: Date | null;
  favorite?: boolean;
}
