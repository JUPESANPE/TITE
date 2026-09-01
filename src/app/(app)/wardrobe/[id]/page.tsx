"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/States";

interface WardrobeItem {
  id: string;
  imageUrl: string;
  category: string;
  primaryColor: string | null;
  warmth: number | null;
  formality: number | null;
  favorite: boolean;
  aiClassified: boolean;
  aiConfirmed: boolean;
}

export default function GarmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/wardrobe/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body) => setItem(body.item))
      .catch(() => setError("No pudimos cargar la prenda."));
  }, [id]);

  async function save(patch: Partial<WardrobeItem>) {
    if (!item) return;
    setSaving(true);
    const res = await fetch(`/api/wardrobe/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      const body = await res.json();
      setItem(body.item);
    }
  }

  async function remove() {
    if (!confirm("¿Borrar esta prenda de tu armario?")) return;
    const res = await fetch(`/api/wardrobe/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/wardrobe");
  }

  if (error) return <ErrorState message={error} />;
  if (!item) return <LoadingState />;

  const needsConfirmation = item.aiClassified && !item.aiConfirmed;

  return (
    <div className="mx-auto max-w-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.imageUrl} alt={item.category} className="mb-4 max-h-80 w-full rounded-2xl object-cover" />

      {needsConfirmation ? (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <p className="text-sm">
            TITE propuso estos datos automáticamente. Confirmalos o corregilos para que las
            recomendaciones sean mejores.
          </p>
        </Card>
      ) : null}

      <Card className="mb-4 flex flex-col gap-3">
        <Field label="Color principal">
          <input
            value={item.primaryColor ?? ""}
            onChange={(e) => setItem({ ...item, primaryColor: e.target.value })}
            onBlur={() => save({ primaryColor: item.primaryColor })}
            className="min-h-[44px] rounded-xl border border-line px-3"
          />
        </Field>
        <Field label={`Abrigo (${item.warmth ?? "-"} / 5)`}>
          <input
            type="range"
            min={1}
            max={5}
            value={item.warmth ?? 3}
            onChange={(e) => setItem({ ...item, warmth: Number(e.target.value) })}
            onMouseUp={() => save({ warmth: item.warmth ?? undefined })}
            onTouchEnd={() => save({ warmth: item.warmth ?? undefined })}
          />
        </Field>
        <Field label={`Formalidad (${item.formality ?? "-"} / 5)`}>
          <input
            type="range"
            min={1}
            max={5}
            value={item.formality ?? 2}
            onChange={(e) => setItem({ ...item, formality: Number(e.target.value) })}
            onMouseUp={() => save({ formality: item.formality ?? undefined })}
            onTouchEnd={() => save({ formality: item.formality ?? undefined })}
          />
        </Field>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => save({ favorite: !item.favorite })}
          disabled={saving}
        >
          {item.favorite ? "♥ Favorita" : "♡ Marcar favorita"}
        </Button>
        {needsConfirmation ? (
          <Button className="flex-1" onClick={() => save({})} disabled={saving}>
            Confirmar
          </Button>
        ) : null}
      </div>

      <Button variant="ghost" className="mt-4 w-full text-danger" onClick={remove}>
        Borrar prenda
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
