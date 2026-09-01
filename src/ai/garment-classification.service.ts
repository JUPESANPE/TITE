import type { GarmentCategory } from "../domain/wardrobe/garment.types";

export interface GarmentClassificationInput {
  imageBuffer: Buffer;
  contentType: string;
  /** Categoría que el usuario ya eligió al sacar la foto, si la eligió (punto 17). */
  categoryHint?: GarmentCategory;
}

export interface GarmentClassificationResult {
  category: GarmentCategory;
  subcategory?: string;
  primaryColor?: string;
  secondaryColors?: string[];
  warmth?: number;
  formality?: number;
  fit?: string;
  styles?: string[];
  /** 0-1. TITE nunca confía ciegamente en esto (punto 18): siempre hay paso de confirmar/corregir. */
  confidence: number;
}

/**
 * Interfaz desacoplada de vendor (punto 66). `RuleBasedClassifier` es el
 * default sin credenciales; un adaptador a un proveedor de vision/LLM real
 * se enchufa acá después sin tocar el resto del dominio.
 */
export interface GarmentClassificationService {
  classify(input: GarmentClassificationInput): Promise<GarmentClassificationResult>;
}
