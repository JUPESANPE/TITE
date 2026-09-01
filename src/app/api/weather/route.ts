import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { resolveUserWeather } from "@/lib/resolve-weather";

/**
 * GET /api/weather?lat=&lon=&city= — usa geolocalización si el cliente la manda.
 * GET /api/weather (sin params) — usa la ciudad guardada en el perfil.
 * Nunca asume una ciudad por default (punto 26).
 */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const weather = await resolveUserWeather(user.id, {
      city: searchParams.get("city") ?? undefined,
      latitude: lat ? Number(lat) : undefined,
      longitude: lon ? Number(lon) : undefined,
    });

    return NextResponse.json({ weather });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
