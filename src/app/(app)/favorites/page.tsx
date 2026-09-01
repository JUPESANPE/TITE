"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";

interface FavoriteItem {
  id: string;
  outfit: {
    id: string;
    explanation: string | null;
    hasRemovedGarments: boolean;
    items: Array<{ id: string; wardrobeItem: { id: string; imageUrl: string; category: string } | null }>;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body) => setFavorites(body.favorites))
      .catch(() => setError("No pudimos cargar tus favoritos."));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!favorites) return <LoadingState />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="Todavía no tenés looks favoritos"
        body="Cuando armes un outfit que te guste, marcalo con el corazón para encontrarlo acá."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {favorites.map((fav) => (
        <div key={fav.id} className="rounded-2xl border border-line bg-paper-raised p-4 shadow-card">
          <div className="mb-2 grid grid-cols-3 gap-2">
            {fav.outfit.items.map((item) =>
              item.wardrobeItem ? (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={item.wardrobeItem.imageUrl} alt={item.wardrobeItem.category} fill sizes="120px" className="object-cover" />
                </div>
              ) : (
                <div key={item.id} className="aspect-square rounded-xl bg-line" />
              ),
            )}
          </div>
          {fav.outfit.hasRemovedGarments ? (
            <p className="text-xs text-warning">Una de estas prendas ya no está en tu armario.</p>
          ) : null}
          {fav.outfit.explanation ? <p className="text-sm text-ink-soft">{fav.outfit.explanation}</p> : null}
        </div>
      ))}
    </div>
  );
}
