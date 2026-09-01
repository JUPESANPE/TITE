import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "./session";
import { OutfitEngineError } from "@/domain/outfit/outfit-engine";
import { MissingCityError, UnknownCityError } from "./resolve-weather";

/** Traduce errores de dominio/validación conocidos a respuestas HTTP consistentes. */
export function toApiErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Datos inválidos", issues: error.issues }, { status: 400 });
  }
  if (error instanceof OutfitEngineError) {
    return NextResponse.json(
      { error: error.message, missingCategories: error.missingCategories },
      { status: 422 },
    );
  }
  if (error instanceof MissingCityError || error instanceof UnknownCityError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  // eslint-disable-next-line no-console
  console.error(error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
