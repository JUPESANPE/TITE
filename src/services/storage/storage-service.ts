export interface StoredFile {
  url: string;
  key: string;
}

export interface UploadInput {
  /** clave/ruta relativa dentro del bucket o carpeta, ej: `${userId}/${uuid}.jpg` */
  key: string;
  data: Buffer;
  contentType: string;
}

/**
 * Interfaz de storage (punto F de ARCHITECTURE.md). En dev usa disco local
 * (`LocalDiskStorageProvider`); en producción se implementa un
 * `S3StorageProvider` real — TODO: requires external credentials
 * (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / bucket), no se inventan acá.
 */
export interface StorageService {
  upload(input: UploadInput): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}
