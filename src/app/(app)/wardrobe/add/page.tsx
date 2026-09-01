"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GARMENT_CATEGORIES } from "@/lib/validation/wardrobe";

const CATEGORY_LABELS: Record<(typeof GARMENT_CATEGORIES)[number], string> = {
  REMERAS: "Remera",
  CAMISAS: "Camisa",
  BUZOS: "Buzo",
  SWEATERS: "Sweater",
  CAMPERAS: "Campera",
  PANTALONES: "Pantalón",
  SHORTS: "Short",
  VESTIDOS: "Vestido",
  FALDAS: "Falda",
  ZAPATILLAS: "Zapatillas",
  ZAPATOS: "Zapatos",
  ACCESORIOS: "Accesorio",
  OTROS: "Otro",
};

/**
 * Flujo: elegir foto -> (opcional) elegir categoría -> TITE clasifica ->
 * se guarda -> el usuario confirma/corrige en la pantalla de la prenda
 * (punto 17-18).
 */
export default function AddGarmentPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    if (category) formData.append("category", category);

    const res = await fetch("/api/wardrobe", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      setError("No pudimos guardar la prenda. Probá de nuevo.");
      return;
    }
    const body = await res.json();
    router.push(`/wardrobe/${body.item.id}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Agregar prenda</h1>

      <Card className="mb-4 flex flex-col items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa de la prenda" className="max-h-72 w-full rounded-xl object-cover" />
        ) : (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line text-ink-soft">
            <span className="text-3xl" aria-hidden="true">
              📷
            </span>
            <p className="text-sm">Sacale una foto o elegí una de tu galería</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={onFileSelected}
          className="hidden"
          aria-label="Elegir foto de la prenda"
        />
        <Button type="button" variant="secondary" className="w-full" onClick={() => inputRef.current?.click()}>
          {preview ? "Cambiar foto" : "Elegir foto"}
        </Button>
      </Card>

      <Card className="mb-4">
        <p className="mb-2 text-sm font-medium">¿Qué tipo de prenda es? (opcional, nos ayuda a clasificarla mejor)</p>
        <div className="flex flex-wrap gap-2">
          {GARMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat === category ? "" : cat)}
              aria-pressed={category === cat}
              className={`min-h-[44px] rounded-full border px-4 text-sm ${
                category === cat ? "border-ink bg-ink text-paper" : "border-line bg-paper-raised text-ink"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </Card>

      {error ? (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={!file || loading} onClick={handleSave}>
        {loading ? "Guardando..." : "Guardar prenda"}
      </Button>
    </div>
  );
}
