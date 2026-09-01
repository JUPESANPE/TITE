"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { WardrobeProgressBar } from "@/components/wardrobe/WardrobeProgressBar";
import { GarmentCard, type GarmentCardData } from "@/components/wardrobe/GarmentCard";
import { copy } from "@/copy/es-AR";

interface WardrobeResponse {
  items: GarmentCardData[];
  progress: { percentage: number; minimumViable: boolean };
}

export default function WardrobePage() {
  const router = useRouter();
  const [data, setData] = useState<WardrobeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wardrobe");
      if (!res.ok) throw new Error("request-failed");
      setData(await res.json());
    } catch {
      setError("No pudimos cargar tu armario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{copy.wardrobe.title}</h1>
        <Link href="/wardrobe/add">
          <Button>{copy.wardrobe.addCta}</Button>
        </Link>
      </div>

      {loading ? <LoadingState label="Cargando tu armario..." /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {data && !loading && !error ? (
        <>
          <WardrobeProgressBar percentage={data.progress.percentage} />
          {data.items.length === 0 ? (
            <EmptyState
              title={copy.wardrobe.emptyTitle}
              body={copy.wardrobe.emptyBody}
              action={
                <Link href="/wardrobe/add">
                  <Button>{copy.wardrobe.addCta}</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data.items.map((item) => (
                <GarmentCard key={item.id} item={item} onClick={() => router.push(`/wardrobe/${item.id}`)} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
