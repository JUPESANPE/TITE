import { Card } from "@/components/ui/Card";
import { copy } from "@/copy/es-AR";

const OPTIONS: Array<{ rating: string; emoji: string; label: string }> = [
  { rating: "LOVE", emoji: "😍", label: "Muy bien" },
  { rating: "GOOD", emoji: "🙂", label: "Bien" },
  { rating: "NEUTRAL", emoji: "😐", label: "Normal" },
  { rating: "DISLIKE", emoji: "🙁", label: "No me gustó" },
];

export function FeedbackPrompt({ onRate }: { onRate: (rating: string) => void }) {
  return (
    <Card>
      <p className="mb-3 font-medium">{copy.outfit.feedbackPrompt}</p>
      <div className="flex justify-between gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => onRate(opt.rating)}
            className="flex min-h-[44px] flex-1 flex-col items-center gap-1 rounded-xl border border-line py-2 text-xs hover:bg-clay-50"
          >
            <span aria-hidden="true" className="text-2xl">
              {opt.emoji}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
