import { LocalDiskStorageProvider } from "./local-disk-provider";
import type { StorageService } from "./storage-service";

export type { StorageService, StoredFile, UploadInput } from "./storage-service";

// TODO: requires external credentials — cuando haya bucket S3-compatible
// configurado (ver .env.example), cambiar esto por `new S3StorageProvider()`
// sin tocar ningún caller (todos dependen de la interfaz, no del proveedor).
export const storageService: StorageService = new LocalDiskStorageProvider();
