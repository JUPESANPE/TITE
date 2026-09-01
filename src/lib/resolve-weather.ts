import { weatherService, type WeatherReading } from "@/services/weather";
import { getProfile } from "@/data/repositories/profile.repository";

export class MissingCityError extends Error {
  constructor() {
    super("Falta la ciudad en tu perfil");
    this.name = "MissingCityError";
  }
}

export class UnknownCityError extends Error {
  constructor() {
    super("No encontramos esa ciudad");
    this.name = "UnknownCityError";
  }
}

/**
 * Resuelve el clima actual para un usuario: usa lat/lon si se pasan
 * (geolocalización del navegador), si no cae a la ciudad guardada en el
 * perfil. Nunca asume una ciudad por default (punto 26).
 */
export async function resolveUserWeather(
  userId: string,
  overrides?: { city?: string; latitude?: number; longitude?: number },
): Promise<WeatherReading> {
  if (overrides?.latitude != null && overrides?.longitude != null) {
    return weatherService.getCurrentWeather({
      city: overrides.city ?? "tu ubicación",
      latitude: overrides.latitude,
      longitude: overrides.longitude,
    });
  }

  const profile = await getProfile(userId);
  if (!profile?.city) throw new MissingCityError();

  if (profile.latitude != null && profile.longitude != null) {
    return weatherService.getCurrentWeather({
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
    });
  }

  const geocoded = await weatherService.geocodeCity(profile.city);
  if (!geocoded) throw new UnknownCityError();
  return weatherService.getCurrentWeather(geocoded);
}
