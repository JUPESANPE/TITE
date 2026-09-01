import { OpenMeteoWeatherService } from "./open-meteo-provider";
import type { WeatherService } from "./weather-service";

export type { WeatherLocation, WeatherReading, WeatherService } from "./weather-service";

// Único punto de la app donde se elige el proveedor de clima concreto.
export const weatherService: WeatherService = new OpenMeteoWeatherService();
