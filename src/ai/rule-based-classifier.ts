import type {
  GarmentClassificationInput,
  GarmentClassificationResult,
  GarmentClassificationService,
} from "./garment-classification.service";
import type { GarmentCategory } from "../domain/wardrobe/garment.types";

/**
 * TODO: requires external credentials — reemplazar por un adaptador a un
 * proveedor de vision/LLM (ej: describir la imagen y mapear atributos) para
 * clasificación real. Sin esas credenciales, este proveedor no "mira" la
 * imagen: devuelve valores por defecto razonables según la categoría que el
 * usuario ya haya elegido al subir la foto, con confianza baja a propósito
 * para forzar el paso de confirmar/corregir (punto 18 — nunca se presenta
 * como si fuera un resultado certero).
 */
const CATEGORY_DEFAULTS: Partial<
  Record<GarmentCategory, Pick<GarmentClassificationResult, "warmth" | "formality" | "styles">>
> = {
  REMERAS: { warmth: 1, formality: 1, styles: ["Casual"] },
  CAMISAS: { warmth: 2, formality: 3, styles: ["Clásico"] },
  BUZOS: { warmth: 3, formality: 1, styles: ["Casual", "Urbano"] },
  SWEATERS: { warmth: 4, formality: 3, styles: ["Clásico"] },
  CAMPERAS: { warmth: 4, formality: 2, styles: ["Urbano"] },
  PANTALONES: { warmth: 2, formality: 3, styles: ["Casual"] },
  SHORTS: { warmth: 1, formality: 1, styles: ["Casual", "Deportivo"] },
  VESTIDOS: { warmth: 2, formality: 3, styles: ["Elegante"] },
  FALDAS: { warmth: 2, formality: 3, styles: ["Elegante"] },
  ZAPATILLAS: { warmth: 2, formality: 1, styles: ["Casual", "Deportivo"] },
  ZAPATOS: { warmth: 2, formality: 4, styles: ["Clásico"] },
  ACCESORIOS: { warmth: 1, formality: 2, styles: [] },
  OTROS: { warmth: 2, formality: 2, styles: [] },
};

export class RuleBasedClassifier implements GarmentClassificationService {
  async classify(input: GarmentClassificationInput): Promise<GarmentClassificationResult> {
    const category = input.categoryHint ?? "OTROS";
    const defaults = CATEGORY_DEFAULTS[category] ?? CATEGORY_DEFAULTS.OTROS!;

    return {
      category,
      confidence: input.categoryHint ? 0.4 : 0.15,
      ...defaults,
    };
  }
}
