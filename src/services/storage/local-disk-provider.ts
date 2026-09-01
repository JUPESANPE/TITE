import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageService, StoredFile, UploadInput } from "./storage-service";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/**
 * Proveedor de storage para desarrollo: guarda en ./uploads y se sirve vía
 * `app/api/uploads/[...path]/route.ts` (con auth). No requiere credenciales.
 * En producción, reemplazar por un `S3StorageProvider` que implemente la
 * misma interfaz — ver storage-service.ts.
 */
export class LocalDiskStorageProvider implements StorageService {
  async upload({ key, data, contentType }: UploadInput): Promise<StoredFile> {
    void contentType; // el content-type real se resuelve al servir el archivo, no al guardarlo
    const destination = path.join(UPLOADS_ROOT, key);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, data);
    return { url: `/api/uploads/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    const target = path.join(UPLOADS_ROOT, key);
    await unlink(target).catch(() => {
      // borrar algo que ya no existe no debería romper el flujo
    });
  }
}
