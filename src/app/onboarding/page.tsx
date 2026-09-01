"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { copy } from "@/copy/es-AR";
import { STYLE_OPTIONS } from "@/lib/validation/profile";

const STEPS = ["nombre", "ciudad", "estilo", "talles"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [tops, setTops] = useState("");
  const [bottoms, setBottoms] = useState("");
  const [shoes, setShoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  function toggleStyle(style: string) {
    setStyles((prev) => (prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]));
  }

  function canAdvance() {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return city.trim().length > 0;
    if (step === 2) return styles.length > 0;
    return true;
  }

  async function finish() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        city,
        stylePreferences: styles,
        sizes: { tops: tops || undefined, bottoms: bottoms || undefined, shoes: shoes || undefined },
      }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("No pudimos guardar tu perfil. Probá de nuevo.");
      return;
    }
    router.push("/wardrobe");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-clay-500 transition-all"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {step === 0 && (
          <Step title={copy.onboarding.title}>
            <label className="text-sm font-medium" htmlFor="name">
              {copy.onboarding.nameLabel}
            </label>
            <input
              id="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] rounded-xl border border-line px-3"
            />
          </Step>
        )}

        {step === 1 && (
          <Step title="¿Desde dónde te vestís?">
            <label className="text-sm font-medium" htmlFor="city">
              {copy.onboarding.cityLabel}
            </label>
            <input
              id="city"
              autoFocus
              placeholder="Ej: Buenos Aires"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="min-h-[44px] rounded-xl border border-line px-3"
            />
            <p className="text-xs text-ink-soft">La usamos para saber cómo está el día — nunca la compartimos sin tu permiso.</p>
          </Step>
        )}

        {step === 2 && (
          <Step title={copy.onboarding.styleLabel}>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => {
                const active = styles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    aria-pressed={active}
                    className={`min-h-[44px] rounded-full border px-4 text-sm ${
                      active ? "border-ink bg-ink text-paper" : "border-line bg-paper-raised text-ink"
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title={copy.onboarding.sizesLabel}>
            <div className="grid grid-cols-3 gap-2">
              <SizeInput label="Remeras" value={tops} onChange={setTops} />
              <SizeInput label="Pantalones" value={bottoms} onChange={setBottoms} />
              <SizeInput label="Calzado" value={shoes} onChange={setShoes} />
            </div>
          </Step>
        )}

        {error ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button disabled={loading} onClick={finish}>
              {loading ? "Guardando..." : copy.onboarding.submit}
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold">{title}</h1>
      {children}
    </div>
  );
}

function SizeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-soft">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] rounded-xl border border-line px-2 text-center text-ink"
      />
    </label>
  );
}
