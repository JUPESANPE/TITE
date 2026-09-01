import Image from "next/image";

export interface GarmentCardData {
  id: string;
  imageUrl: string;
  category: string;
  name?: string | null;
  primaryColor?: string | null;
  aiClassified: boolean;
  aiConfirmed: boolean;
}

export function GarmentCard({ item, onClick }: { item: GarmentCardData; onClick?: () => void }) {
  const needsConfirmation = item.aiClassified && !item.aiConfirmed;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-paper-raised text-left"
    >
      <Image
        src={item.imageUrl}
        alt={item.name ?? `${item.category} ${item.primaryColor ?? ""}`.trim()}
        fill
        sizes="(max-width: 768px) 45vw, 200px"
        className="object-cover transition-transform group-hover:scale-105"
      />
      {needsConfirmation ? (
        <span className="absolute left-2 top-2 rounded-full bg-warning px-2 py-0.5 text-[10px] font-medium text-white">
          Confirmar datos
        </span>
      ) : null}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 text-xs text-white">
        {item.name ?? item.category}
      </span>
    </button>
  );
}
