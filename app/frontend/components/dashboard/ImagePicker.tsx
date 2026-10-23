// ============ app/frontend/components/dashboard/ImagePicker.tsx ============
"use client";

import { useRef, useState } from "react";

export interface ImagePreset {
  label: string;
  url: string; // chemin public (ex. /floralTemplate/bouquet-1.png) ou URL absolue
}

interface Props {
  label: string;
  value: string; // "" = image d'origine du template
  defaultValue: string; // image d'origine (affichée quand value est vide)
  onChange: (url: string) => void;
  presets?: ImagePreset[]; // images proposées par le template
  // Reçoit le fichier choisi sur l'appareil, renvoie l'URL finale (image stockée en base).
  onUpload: (file: File) => Promise<string>;
  hint?: string;
}

export function ImagePicker({ label, value, defaultValue, onChange, presets = [], onUpload, hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = value || defaultValue;
  const isDefault = !value || value === defaultValue;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return setError("Fichier non supporté : choisissez une photo (JPG, PNG ou WebP).");
    }
    if (file.size > 25 * 1024 * 1024) return setError("Image trop lourde (25 Mo maximum).");
    setError(null);
    setUploading(true);
    try {
      onChange(await onUpload(file));
    } catch {
      setError("L'envoi a échoué, réessayez.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange("");
            }}
            className="text-xs text-foreground/50 hover:text-gold transition-colors"
          >
            Image d&apos;origine
          </button>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Aperçu : <img> simple, jamais d'import (les fichiers viennent de /public ou d'une URL). */}
        <div className="w-24 h-24 shrink-0 rounded-xl border border-border bg-foreground/5 overflow-hidden flex items-center justify-center">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-foreground/40">Aucune</span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const selected = current === p.url;
                return (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => onChange(p.url)}
                    title={p.label}
                    className={`w-14 h-14 rounded-lg border overflow-hidden bg-foreground/5 ${
                      selected ? "ring-2 ring-gold border-transparent" : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.label} className="w-full h-full object-contain" />
                  </button>
                );
              })}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:border-foreground/40 disabled:opacity-50"
          >
            {uploading ? "Envoi…" : "Choisir une image sur mon appareil"}
          </button>

          {hint && <p className="text-xs text-foreground/50">{hint}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}