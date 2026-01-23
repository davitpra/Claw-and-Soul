import { Style } from "@/entities/art-style/model/styles";

interface IAStep1Props {
  hasFile: boolean;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: Style[];
  selectedStyle: string;
  onStyleSelect: (name: string) => void;
  onNext: () => void;
}

export function IAStep1({
  hasFile,
  previewUrl,
  onFileChange,
  styles,
  selectedStyle,
  onStyleSelect,
  onNext,
}: IAStep1Props) {
  return (
    <>
      <main className="flex-grow px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-4xl mx-auto space-y-10">
          <section>
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-2 tracking-tight font-display">
                Upload Your Pet's Photo
              </h1>
              <p className="text-slate-dark/70 text-lg">
                We'll use this as the base for your masterpiece.
              </p>
            </div>
            <div className="relative group bg-white rounded-2xl p-4 md:p-8 border-2 border-dashed border-primary/40 hover:border-primary hover:bg-[#F8FDFF] transition-all cursor-pointer text-center shadow-sm overflow-hidden">
              <input
                aria-label="Upload photo"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                type="file"
                onChange={onFileChange}
              />
              <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
                {previewUrl ? (
                  <div className="relative size-64 md:size-90 mb-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl shadow-md border-2 border-primary/20"
                    />
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                      <span className="material-symbols-outlined text-sm block">
                        check
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-4xl">
                      add_a_photo
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-dark">
                  {hasFile
                    ? "Photo Uploaded Successfully!"
                    : "Drag & Drop your best pet photo here"}
                </h3>
                <p className="text-slate-dark/80">
                  {hasFile
                    ? "You can click to choose a different photo"
                    : "or click to browse from your device"}
                </p>
                {!hasFile && (
                  <div className="mt-4 px-4 py-2 bg-cream rounded-lg flex items-center gap-2 text-sm text-slate-dark/90 border border-slate-dark/5">
                    <span className="material-symbols-outlined text-base text-primary">
                      light_mode
                    </span>
                    <span>
                      <strong>Tip:</strong> Clear lighting works best!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            <div className="flex items-center gap-3 mb-6">
              <span className="size-8 rounded-full bg-slate-dark text-white flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h2 className="text-2xl font-black text-slate-dark tracking-tight font-display">
                Choose Your Art Style
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {styles.map((style) => {
                const isSelected = selectedStyle === style.name;
                return (
                  <div
                    key={style.name}
                    className="group relative cursor-pointer"
                    onClick={() => onStyleSelect(style.name)}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 z-20 bg-primary text-white rounded-full p-1.5 shadow-md animate-in zoom-in duration-300">
                        <span className="material-symbols-outlined text-lg block">
                          check
                        </span>
                      </div>
                    )}
                    <div
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 shadow-lg"
                          : "border-transparent"
                      }`}
                    >
                      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                        <img
                          alt={style.name}
                          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                            isSelected
                              ? "opacity-100"
                              : "opacity-90 group-hover:opacity-100"
                          }`}
                          src={style.img}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                        {style.label && (
                          <span className="block text-[10px] font-bold opacity-90 uppercase tracking-widest mb-0.5">
                            {style.label}
                          </span>
                        )}
                        <span className="block text-base font-bold leading-tight">
                          {style.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <div className="sticky bottom-0 z-40 bg-white/80 backdrop-blur-md border-t border-[#E5E0D8] p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-dark/70">
              Next: We'll generate 4 unique variations for you.
            </p>
          </div>
          <button
            onClick={onNext}
            className={`w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold transition-all shadow-lg ${
              hasFile
                ? "bg-primary text-white hover:bg-primary-dark hover:scale-105 shadow-primary/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
            disabled={!hasFile}
          >
            Continue to Preview
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  );
}
