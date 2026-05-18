import Link from "next/link";
import Image from "next/image";
import { GenerationStatus } from "@/hooks/useGenerationStatus";

const STEP_LABELS: Record<number, string> = {
  1: "Elige tu estilo",
  2: "Crea tu cuenta",
  3: "Sube tu foto",
  4: "¡Listo!",
};

const TOTAL_STEPS = 4;

interface IAHeaderProps {
  step: number;
  generationStatus?: GenerationStatus;
}

export function IAHeader({ step, generationStatus }: IAHeaderProps) {
  const isGenerating =
    generationStatus === "pending" || generationStatus === "processing";

  return (
    <header className="bg-white border-b border-[#E5E0D8] sticky top-0 z-50">
      <div className="px-6 md:px-10 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="size-10 relative bg-white rounded-full">
            <Image
              src="/Logo.jpg"
              alt="Claw and Soul Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-slate-dark text-xl font-bold tracking-tight font-display">
            Claw and Soul
          </h2>
        </Link>

        {isGenerating ? (
          <div className="hidden md:flex items-center gap-4 opacity-70 animate-in fade-in duration-700">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Generando
              </span>
              <span className="text-sm font-medium text-slate-dark">
                Creando tu arte con IA...
              </span>
            </div>
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4 animate-in fade-in duration-700">
            <div className="w-52 h-2 bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center justify-center px-4 h-9 rounded-lg border border-[#E5E0D8] text-sm font-bold text-slate-dark hover:bg-gray-50 transition-colors">
            Help
          </button>
          <Link
            href="/"
            className="flex items-center justify-center size-9 rounded-lg border border-[#E5E0D8] text-slate-dark hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="md:hidden w-full h-1 bg-[#dee2e3]">
        <div
          className="h-full bg-primary transition-all duration-700"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </header>
  );
}
