import { Style } from "@/entities/art-style/model/styles";
import { Card } from "@/shared/ui/Card";

interface StyleCardProps {
  style: Style;
  isSelected: boolean;
  onSelect: (style: Style) => void;
}

export function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => onSelect(style)}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 z-20 bg-primary text-white rounded-full p-1.5 shadow-md animate-in zoom-in duration-300">
          <span className="material-symbols-outlined text-lg block">check</span>
        </div>
      )}
      <Card
        imageUrl={style.img}
        imageAlt={style.name}
        className={`transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full p-3 text-white">
          <span className="block text-base font-bold leading-tight">
            {style.name}
          </span>
        </div>
      </Card>
    </div>
  );
}
