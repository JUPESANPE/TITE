export interface WeatherReading {
  city: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  rainChance: number;
  windSpeed: number;
  condition: string;
  provider: string;
}

export interface WeatherLocation {
  city: string;
  latitude: number;
  longitude: number;
}

/**
 * Desacoplado del proveedor (punto 26): hoy es Open-Meteo, mañana puede ser
 * otro sin tocar nada fuera de services/weather/**.
 */
export interface WeatherService {
  getCurrentWeather(location: WeatherLocation): Promise<WeatherReading>;
  geocodeCity(query: string): Promise<WeatherLocation | null>;
}
