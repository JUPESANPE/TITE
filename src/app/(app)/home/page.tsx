"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OccasionPicker } from "@/components/outfit/OccasionPicker";
import { copy } from "@/copy/es-AR";

interface WeatherReading {
  temp: number;
  feelsLike: number;
  condition: string;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [weatherRes, pointsRes] = await Promise.all([
        fetch("/api/weather"),
        fetch("/api/points"),
      ]);
      if (weatherRes.ok) {
        setWeather((await weatherRes.json()).weather);
      } else {
        setWeatherError((await weatherRes.json().catch(() => ({}))).error ?? "No pudimos obtener el clima.");
      }
      if (pointsRes.ok) {
        const body = await pointsRes.json();
        setBalance(body.balance);
        setStreak(body.streak.currentCount);
      }
      setLoading(false);
    }
    load();
  }, []);

  function goToOutfit() {
    const params = occasion ? `?occasion=${occasion}` : "";
    router.push(`/outfit${params}`);
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{copy.home.greeting(firstName)}</h1>
        {loading ? (
          <p className="text-sm text-ink-soft">Cargando el clima...</p>
        ) : weather ? (
          <p className="text-ink-soft">
            <span className="text-2xl font-semibold text-ink">{Math.round(weather.temp)}°</span>{" "}
            {weather.condition}
          </p>
        ) : weatherError ? (
          <p className="text-sm text-danger">{weatherError}</p>
        ) : null}
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-medium">{copy.home.mainQuestion}</h2>
        <OccasionPicker value={occasion} onChange={setOccasion} />
        <Button className="mt-4 w-full" onClick={goToOutfit}>
          Elegir mi outfit
        </Button>
      </Card>

      <div className="flex items-center justify-between text-sm text-ink-soft">
        {streak > 0 ? <span>{copy.home.streak(streak)}</span> : <span />}
        <span>
          {balance} {copy.points.label}
        </span>
      </div>
    </div>
  );
}
