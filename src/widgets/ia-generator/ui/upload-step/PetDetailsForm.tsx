"use client";

import { ContinueButton } from "./ContinueButton";
import { SPECIES_OPTIONS, type Pet, type PetForm } from "./types";

interface PetDetailsFormProps {
  formId: string;
  pets: Pet[];
  activePet: Pet | null;
  isExistingPet: boolean;
  form: PetForm;
  formError: string | null;
  hasPhoto: boolean;
  hasParams: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSelectPet: (pet: Pet) => void;
  onResetPet: () => void;
}

/**
 * Columna derecha del paso de subida: selección de mascota existente y campos
 * editables (nombre, especie, raza, edad).
 */
export function PetDetailsForm({
  formId,
  pets,
  activePet,
  isExistingPet,
  form,
  formError,
  hasPhoto,
  hasParams,
  submitting,
  onSubmit,
  onFieldChange,
  onSelectPet,
  onResetPet,
}: PetDetailsFormProps) {
  return (
    <div>
      <h2 className="font-display text-xl font-black text-slate-dark mb-4">
        Pet Details
      </h2>

      {isExistingPet && activePet && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="material-symbols-outlined text-primary text-[18px]">
            check_circle
          </span>
          <span className="text-sm font-semibold text-primary">
            {activePet.name} selected
          </span>
          <button
            type="button"
            onClick={onResetPet}
            className="bg-white ml-auto text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Cambiar
          </button>
        </div>
      )}

      <form id={formId} onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Pets
          </label>
          {pets.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                pets
              </span>
              <span>No pets yet.</span>
            </div>
          ) : (
            <div className="relative">
              <select
                value={activePet?.id ?? ""}
                onChange={(e) => {
                  const pet = pets.find((p) => p.id === e.target.value);
                  if (pet) onSelectPet(pet);
                  else onResetPet();
                }}
                className="w-full appearance-none border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-shadow"
              >
                <option value="">+ Add a new pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`${p.name}${p.species ? ` (${p.species}${p.breed ? ` · ${p.breed}` : ""})` : ""}`}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                expand_more
              </span>
            </div>
          )}
        </div>

        {!isExistingPet && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pet Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={onFieldChange}
              placeholder="e.g., Buddy"
              maxLength={100}
              autoComplete="off"
              className="w-full border bg-white border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Species
          </label>
          <div className="relative">
            <select
              name="species"
              value={form.species}
              onChange={onFieldChange}
              className="w-full appearance-none border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-shadow"
            >
              {SPECIES_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
              expand_more
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Breed
          </label>
          <input
            name="breed"
            value={form.breed}
            onChange={onFieldChange}
            placeholder="e.g., Golden Retriever"
            maxLength={100}
            className="w-full border bg-white border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Age
          </label>
          <input
            name="age"
            value={form.age}
            onChange={onFieldChange}
            type="number"
            min={0}
            max={50}
            placeholder="e.g., 3"
            className="w-full border bg-white border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        </div>

        {formError && <p className="text-red-500 text-xs">{formError}</p>}
      </form>

      <ContinueButton
        formId={formId}
        hasPhoto={hasPhoto}
        hasName={isExistingPet || form.name.trim().length > 0}
        hasParams={hasParams}
        submitting={submitting}
        isExistingPet={isExistingPet}
      />
    </div>
  );
}
