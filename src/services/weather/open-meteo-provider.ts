import type { WeatherLocation, WeatherReading, WeatherService } from "./weather-service";

// Open-Meteo es gratuito y no requiere API key (punto 26). Documentación:
// https://open-meteo.com/en/docs y https://open-meteo.com/en/docs/geocoding-api
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Subconjunto de códigos WMO (https://open-meteo.com/en/docs) suficiente
// para no mostrar TITE como "una app del clima" (punto 27): sólo lo relevante.
const WEATHER_CODE_CONDITION: Record<number, string> = {
  0: "despejado",
  1: "mayormente despejado",
  2: "parcialmente nublado",
  3: "nublado",
  45: "neblina",
  48: "neblina con escarcha",
  51: "llovizna",
  53: "llovizna",
  55: "llovizna intensa",
  61: "lluvia",
  63: "lluvia",
  65: "lluvia intensa",
  71: "nieve",
  73: "nieve",
  75: "nieve intensa",
  80: "chaparrones",
  81: "chaparrones",
  82: "chaparrones fuertes",
  95: "tormenta",
  96: "tormenta con granizo",
  99: "tormenta con granizo",
};

function conditionFromCode(code: number): string {
  return WEATHER_CODE_CONDITION[code] ?? "variable";
}

export class OpenMeteoWeatherService implements WeatherService {
  async getCurrentWeather(location: WeatherLocation): Promise<WeatherReading> {
    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", String(location.latitude));
    url.searchParams.set("longitude", String(location.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weather_code",
    );
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!response.ok) {
      throw new Error(`Open-Meteo respondió ${response.status}`);
    }
    const data = await response.json();

    return {
      city: location.city,
      temp: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      tempMin: data.daily.temperature_2m_min[0],
      tempMax: data.daily.temperature_2m_max[0],
      rainChance: data.current.precipitation_probability ?? data.daily.precipitation_probability_max[0] ?? 0,
      windSpeed: data.current.wind_speed_10m,
      condition: conditionFromCode(data.current.weather_code),
      provider: "open-meteo",
    };
  }

  async geocodeCity(query: string): Promise<WeatherLocation | null> {
    const url = new URL(GEOCODING_URL);
    url.searchParams.set("name", query);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "es");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Open-Meteo geocoding respondió ${response.status}`);
    }
    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return null;

    return { city: result.name, latitude: result.latitude, longitude: result.longitude };
  }
}
