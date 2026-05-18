import { Style } from "@/entities/art-style/model/styles";
import { StyleCard } from "@/entities/art-style/ui/StyleCard";
import { StepNavigation } from "./StepNavigation";
import { StyleCollection } from "@/widgets/collection";
import { Container } from "@/shared/ui/Container";

interface IAStyleStepProps {
  styles: Style[];
  selectedStyle: Style | null;
  onStyleSelect: (style: Style) => void;
  onBack?: () => void;
  onNext: () => void;
  isLoading?: boolean;
  error?: string | null;
  isFiltered?: boolean;
}

export function IAStyleStep({
  styles,
  selectedStyle,
  onStyleSelect,
  onBack,
  onNext,
  isLoading = false,
  error = null,
  isFiltered = false,
}: IAStyleStepProps) {
  return (
    <Container
      as="main"
      className="grow py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex flex-col justify-center md:flex-row md:justify-between">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-2 tracking-tight font-display">
            Choose Your Art Style
          </h1>
          <p className="text-slate-dark/70 text-lg">
            {isFiltered
              ? "Showing styles compatible with your selected product and size."
              : "Pick the style that best fits your vision."}
          </p>
        </div>
        <div className="self-center md:self-auto">
          <StepNavigation
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue to Preview"
            disableNext={!selectedStyle || isLoading || styles.length === 0}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-semibold">
          {error}
        </div>
      ) : styles.length === 0 ? (
        <div className="text-center py-12 text-slate-dark/60 font-semibold">
          {isFiltered
            ? "No compatible styles available for this product and size."
            : "No styles available."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-20">
            {styles.map((style) => (
              <StyleCard
                key={style.id ?? style.name}
                style={style}
                isSelected={selectedStyle?.name === style.name}
                onSelect={onStyleSelect}
              />
            ))}
          </div>
          {selectedStyle && <StyleCollection styleId={selectedStyle.id} />}
        </>
      )}
    </Container>
  );
}
