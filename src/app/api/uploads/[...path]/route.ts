import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

interface Params {
  params: Promise<{ path: string[] }>;
}

/**
 * Sirve imágenes subidas en dev (LocalDiskStorageProvider). Las keys se
 * generan como `${userId}/archivo.ext`, así que alcanza con chequear que el
 * primer segmento del path coincida con el usuario autenticado (punto 11:
 * ownership derivado de la sesión, no del path que manda el cliente).
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { path: segments } = await params;

    if (segments[0] !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const safeSegments = segments.filter((s) => s !== ".." && s !== ".");
    if (safeSegments.length !== segments.length) {
      return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
    }

    const filePath = path.join(UPLOADS_ROOT, ...safeSegments);
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    return toApiErrorResponse(error);
  }
}
