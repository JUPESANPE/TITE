import { RuleBasedClassifier } from "./rule-based-classifier";
import type { GarmentClassificationService } from "./garment-classification.service";

export type {
  GarmentClassificationInput,
  GarmentClassificationResult,
  GarmentClassificationService,
} from "./garment-classification.service";

// TODO: requires external credentials — cuando haya un proveedor de vision/LLM
// configurado, cambiar acá por el adaptador real sin tocar los callers.
export const garmentClassificationService: GarmentClassificationService = new RuleBasedClassifier();
