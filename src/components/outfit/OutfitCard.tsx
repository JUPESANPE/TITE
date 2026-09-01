import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface OutfitItemData {
  id: string;
  role: string;
  wardrobeItem: { id: string; imageUrl: string; category: string } | null;
  garmentSnapshot?: { category?: string; primaryColor?: string } | null;
}

export interface OutfitData {
  id: string;
  explanation: string | null;
  items: OutfitItemData[];
}

export function OutfitCard({
  outfit,
  onSelect,
  onAnotherOption,
  onFavorite,
  favorited,
  busy,
}: {
  outfit: OutfitData;
  onSelect: () => void;
  onAnotherOption: () => void;
  onFavorite: () => void;
  favorited?: boolean;
  busy?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4 shadow-card">
      <div className="mb-3 grid grid-cols-3 gap-2">
        {outfit.items.map((item) =>
          item.wardrobeItem ? (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
              <Image src={item.wardrobeItem.imageUrl} alt={item.wardrobeItem.category} fill sizes="120px" className="object-cover" />
            </div>
          ) : (
            <div
              key={item.id}
              className="flex aspect-square items-center justify-center rounded-xl bg-line text-center text-[10px] text-ink-soft"
            >
              Ya no está en tu armario
            </div>
          ),
        )}
      </div>

      {outfit.explanation ? <p className="mb-3 text-sm text-ink-soft">{outfit.explanation}</p> : null}

      <div className="flex flex-col gap-2">
        <Button onClick={onSelect} disabled={busy}>
          Me pongo este
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onAnotherOption} disabled={busy}>
            Otra opción
          </Button>
          <Button variant="ghost" onClick={onFavorite} aria-pressed={favorited} disabled={busy}>
            {favorited ? "♥" : "♡"}
          </Button>
        </div>
      </div>
    </div>
  );
}
