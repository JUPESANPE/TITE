"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { OccasionPicker, OCCASION_LABELS } from "@/components/outfit/OccasionPicker";
import { OutfitCard, type OutfitData } from "@/components/outfit/OutfitCard";
import { FeedbackPrompt } from "@/components/outfit/FeedbackPrompt";
import { copy } from "@/copy/es-AR";

type Phase = "pick-occasion" | "loading" | "results" | "error" | "impossible";

function OutfitPageInner() {
  const searchParams = useSearchParams();
  const initialOccasion = searchParams.get("occasion");

  const [occasion, setOccasion] = useState<string | null>(initialOccasion);
  const [phase, setPhase] = useState<Phase>(initialOccasion ? "loading" : "pick-occasion");
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [missingCategories, setMissingCategories] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [feedbackDone, setFeedbackDone] = useState(false);

  async function generate(chosenOccasion: string) {
    setPhase("loading");
    setSelectedOutfitId(null);
    setFeedbackDone(false);
    try {
      const res = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion: chosenOccasion }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (res.status === 422 && body.missingCategories) {
          setMissingCategories(body.missingCategories);
          setPhase("impossible");
          return;
        }
        setErrorMessage(body.error ?? "No pudimos generar tu outfit.");
        setPhase("error");
        return;
      }
      setOutfits(body.outfits);
      setPhase("results");
    } catch {
      setErrorMessage("No pudimos conectar con TITE. Probá de nuevo.");
      setPhase("error");
    }
  }

  function handlePickOccasion(value: string) {
    setOccasion(value);
    generate(value);
  }

  async function handleAnotherOption(outfit: OutfitData) {
    if (!occasion) return;
    setBusyId(outfit.id);
    try {
      const res = await fetch("/api/outfits/alternative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, excludeOutfitIds: outfits.map((o) => o.id) }),
      });
      if (res.ok) {
        const { outfit: replacement } = await res.json();
        setOutfits((prev) => prev.map((o) => (o.id === outfit.id ? replacement : o)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleSelect(outfit: OutfitData) {
    setBusyId(outfit.id);
    try {
      const res = await fetch(`/api/outfits/${outfit.id}/select`, { method: "POST" });
      if (res.ok) setSelectedOutfitId(outfit.id);
    } finally {
      setBusyId(null);
    }
  }

  async function handleFavorite(outfit: OutfitData) {
    const res = await fetch(`/api/outfits/${outfit.id}/favorite`, { method: "POST" });
    if (res.ok) {
      const { favorited: isFav } = await res.json();
      setFavorited((prev) => ({ ...prev, [outfit.id]: isFav }));
    }
  }

  async function handleFeedback(rating: string) {
    if (!selectedOutfitId) return;
    await fetch(`/api/outfits/${selectedOutfitId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    setFeedbackDone(true);
  }

  if (phase === "pick-occasion") {
    return (
      <Card>
        <h1 className="mb-3 text-lg font-medium">{copy.home.mainQuestion}</h1>
        <OccasionPicker value={occasion} onChange={handlePickOccasion} />
      </Card>
    );
  }

  if (phase === "loading") return <LoadingState label={copy.outfit.generating} />;

  if (phase === "error") {
    return <ErrorState message={errorMessage} onRetry={() => occasion && generate(occasion)} />;
  }

  if (phase === "impossible") {
    const labels = missingCategories
      .map((c) => (c === "FOOTWEAR" ? "calzado" : c === "TOP" ? "remeras/camisas" : c === "BOTTOM" ? "pantalones" : c))
      .join(", ");
    return (
      <EmptyState
        title={copy.outfit.impossibleTitle}
        body={`Para armarte un look nos falta: ${labels}. Sumalas a tu armario y volvemos a intentar.`}
        action={
          <Link href="/wardrobe/add">
            <Button>Agregar prenda</Button>
          </Link>
        }
      />
    );
  }

  if (selectedOutfitId) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <p className="font-medium">¡Buenísimo! Ya elegiste tu look de hoy.</p>
          <p className="text-sm text-ink-soft">Sumaste Points y tu racha se actualizó.</p>
        </Card>
        {feedbackDone ? (
          <Card>
            <p className="text-sm text-ink-soft">Gracias, TITE te conoce un poco más. 🙌</p>
          </Card>
        ) : (
          <FeedbackPrompt onRate={handleFeedback} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium">
        {occasion ? `Para hoy, ${OCCASION_LABELS[occasion]?.toLowerCase()}` : copy.home.mainQuestion}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {outfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            busy={busyId === outfit.id}
            favorited={favorited[outfit.id]}
            onSelect={() => handleSelect(outfit)}
            onAnotherOption={() => handleAnotherOption(outfit)}
            onFavorite={() => handleFavorite(outfit)}
          />
        ))}
      </div>
    </div>
  );
}

export default function OutfitPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OutfitPageInner />
    </Suspense>
  );
}
