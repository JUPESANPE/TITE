import { copy } from "@/copy/es-AR";

export function WardrobeProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{copy.wardrobe.progress(percentage)}</span>
        <span className="text-ink-soft">{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-clay-500 transition-all"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
