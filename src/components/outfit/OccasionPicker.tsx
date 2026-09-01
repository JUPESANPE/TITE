export const OCCASION_LABELS: Record<string, string> = {
  CASUAL: "Casual",
  COMODO: "Cómodo",
  FORMAL: "Formal",
  ENTRENAMIENTO: "Entrenamiento",
  SALIR: "Salir",
};

export function OccasionPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (occasion: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir ocasión">
      {Object.entries(OCCASION_LABELS).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`min-h-[44px] rounded-full border px-4 text-sm transition-colors ${
            value === key ? "border-ink bg-ink text-paper" : "border-line bg-paper-raised text-ink hover:bg-clay-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
