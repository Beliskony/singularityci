// ============ app/frontend/components/dashboard/ColorPicker.tsx ============
"use client";

import { useEffect, useState } from "react";

// Palette de base proposée partout : l'utilisateur n'a pas à choisir au hasard.
export const BASE_COLOR_PRESETS: string[] = [
  "#4a0e1a", // bordeaux
  "#330a12", // bordeaux foncé
  "#c9a24a", // or
  "#f5ecd9", // crème
  "#ffffff", // blanc
  "#1f1f1f", // noir doux
  "#1e3a2f", // vert sapin
  "#16324f", // bleu nuit
  "#d98ca0", // rose poudré
  "#7a5c8a", // mauve
];

interface Props {
  label: string;
  value: string; // couleur courante (hex)
  defaultValue: string; // couleur d'origine du template
  onChange: (hex: string) => void;
  presets?: string[]; // palette de base (sinon BASE_COLOR_PRESETS)
}

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function ColorPicker({ label, value, defaultValue, onChange, presets = BASE_COLOR_PRESETS }: Props) {
  const [text, setText] = useState(value);

  // Garde le champ texte synchronisé quand la valeur change depuis l'extérieur
  // (swatch, sélecteur natif, réinitialisation).
  useEffect(() => setText(value), [value]);

  // La couleur d'origine du template est toujours proposée en premier.
  const swatches = [defaultValue, ...presets.filter((p) => p.toLowerCase() !== defaultValue.toLowerCase())];
  const isDefault = value.toLowerCase() === defaultValue.toLowerCase();

  function commitText(raw: string) {
    const v = raw.startsWith("#") ? raw : `#${raw}`;
    if (HEX_RE.test(v)) onChange(v.toLowerCase());
    else setText(value); // saisie invalide : on revient à la valeur courante
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-foreground/50 hover:text-gold transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {swatches.map((c, i) => {
          const selected = c.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-label={i === 0 ? `${c} (couleur d'origine)` : c}
              title={i === 0 ? "Couleur d'origine" : c}
              className={`w-7 h-7 rounded-full border transition-transform hover:scale-110 ${
                selected ? "ring-2 ring-gold ring-offset-2 ring-offset-background border-transparent" : "border-border"
              }`}
              style={{ backgroundColor: c }}
            />
          );
        })}

        {/* Couleur libre : sélecteur natif */}
        <label
          className="relative w-7 h-7 rounded-full border border-dashed border-foreground/40 flex items-center justify-center text-xs text-foreground/60 cursor-pointer hover:border-gold overflow-hidden"
          title="Couleur personnalisée"
        >
          +
          <input
            type="color"
            value={HEX_RE.test(value) ? value : defaultValue}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commitText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitText(text)}
          maxLength={7}
          spellCheck={false}
          className="w-24 px-2 py-1 rounded-lg border border-border bg-background text-xs font-mono text-foreground"
          aria-label={`${label} (code hexadécimal)`}
        />
      </div>
    </div>
  );
}