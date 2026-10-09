// ============ app/frontend/components/dashboard/PersonnalisationForm.tsx ============
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ISite, ISiteImage, SiteStatus, SiteImageRole, IProgramItem } from "@/app/server/sites/ISite";
import { TemplateFieldSchema } from "@/app/frontend/types/TemplateFielSchemas";

// ⚠️ Vérifie que TemplateFielSchemas.ts est bien placé à ce chemin exact
// (celui que Site.service.ts importe déjà) — sinon ajuste l'import ici
// et dans Site.service.ts pour qu'ils pointent vers le même fichier.

interface Props {
  site: ISite;
  images: ISiteImage[];
  fieldSchema: TemplateFieldSchema;
}

const ROLE_LABEL: Record<SiteImageRole, string> = {
  [SiteImageRole.HERO]: "Photo principale",
  [SiteImageRole.GALLERY]: "Galerie",
  [SiteImageRole.VENUE]: "Lieu de réception",
};

function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function PersonnalisationForm({ site, images, fieldSchema }: Props) {
  const router = useRouter();
  const eventDateLocked = site.status === SiteStatus.ACTIVE;

  const [groomName, setGroomName] = useState(site.groomName);
  const [brideName, setBrideName] = useState(site.brideName);
  const [eventDate, setEventDate] = useState(toDateInputValue(site.eventDate));
  const [themeColors, setThemeColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fieldSchema.colorFields) {
      initial[field.key] = site.themeColors?.[field.key] ?? field.defaultValue;
    }
    return initial;
  });
  const [customTexts, setCustomTexts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fieldSchema.textFields) {
      initial[field.key] = site.customTexts?.[field.key] ?? field.defaultValue;
    }
    return initial;
  });
  const [programItems, setProgramItems] = useState<IProgramItem[]>(site.programItems ?? []);

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const maxProgramItems = fieldSchema.maxProgramItems ?? 0;

  function addProgramItem() {
    if (programItems.length >= maxProgramItems) return;
    setProgramItems([...programItems, { time: "", label: "" }]);
  }

  function updateProgramItem(index: number, patch: Partial<IProgramItem>) {
    setProgramItems(programItems.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeProgramItem(index: number) {
    setProgramItems(programItems.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const payload: Record<string, unknown> = {
      groomName,
      brideName,
      themeColors,
      customTexts,
      programItems,
    };
    // eventDate n'est envoyé que si encore modifiable — Site.service.ts
    // renvoie 409 (CANNOT_CHANGE_EVENT_DATE_AFTER_PAYMENT) sinon.
    if (!eventDateLocked) {
      payload.eventDate = eventDate;
    }

    try {
      const res = await fetch(`/api/client/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "SAVE_FAILED");
      }

      setFeedback({ type: "success", message: "Modifications enregistrées." });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error && error.message === "SITE_NOT_EDITABLE_IN_CURRENT_STATUS"
            ? "Ce site n'est plus modifiable."
            : "Une erreur est survenue, réessaie.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-10">
      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* ---- Informations ---- */}
      <section>
        <h2 className="font-display italic text-xl text-foreground">Informations</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-foreground/60">Prénom du marié</span>
            <input
              type="text"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              maxLength={60}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/60">Prénom de la mariée</span>
            <input
              type="text"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              maxLength={60}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-foreground/60">Date de l'événement</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={eventDateLocked}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground disabled:opacity-50"
            />
            {eventDateLocked && (
              <span className="mt-1 block text-xs text-foreground/50">
                Cette date correspond à la fin de ton abonnement — elle ne peut plus être changée une
                fois le site payé.
              </span>
            )}
          </label>
        </div>
      </section>

      {/* ---- Couleurs ---- */}
      {fieldSchema.colorFields.length > 0 && (
        <section>
          <h2 className="font-display italic text-xl text-foreground">Couleurs</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {fieldSchema.colorFields.map((field) => (
              <label key={field.key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColors[field.key]}
                  onChange={(e) => setThemeColors({ ...themeColors, [field.key]: e.target.value })}
                  className="h-10 w-14 rounded-md border border-border bg-background"
                />
                <span className="text-sm text-foreground">{field.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* ---- Textes ---- */}
      {fieldSchema.textFields.length > 0 && (
        <section>
          <h2 className="font-display italic text-xl text-foreground">Textes</h2>
          <div className="mt-4 space-y-4">
            {fieldSchema.textFields.map((field) => (
              <label key={field.key} className="block">
                <span className="flex items-center justify-between text-sm text-foreground/60">
                  {field.label}
                  <span>
                    {(customTexts[field.key] ?? "").length}/{field.maxLength}
                  </span>
                </span>
                <textarea
                  value={customTexts[field.key] ?? ""}
                  onChange={(e) => setCustomTexts({ ...customTexts, [field.key]: e.target.value })}
                  maxLength={field.maxLength}
                  rows={field.maxLength > 60 ? 3 : 1}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </label>
            ))}
          </div>
        </section>
      )}

      {/* ---- Programme ---- */}
      {maxProgramItems > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display italic text-xl text-foreground">Programme</h2>
            <button
              type="button"
              onClick={addProgramItem}
              disabled={programItems.length >= maxProgramItems}
              className="text-sm text-gold hover:underline disabled:opacity-40 disabled:no-underline"
            >
              + Ajouter une étape
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {programItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => updateProgramItem(index, { time: e.target.value })}
                  placeholder="08:00"
                  maxLength={10}
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateProgramItem(index, { label: e.target.value })}
                  placeholder="Accueil des invités"
                  maxLength={100}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => removeProgramItem(index)}
                  className="px-2 text-foreground/40 hover:text-red-600"
                  aria-label="Supprimer cette étape"
                >
                  ✕
                </button>
              </div>
            ))}
            {programItems.length === 0 && (
              <p className="text-sm text-foreground/50">Aucune étape pour l'instant.</p>
            )}
          </div>
        </section>
      )}

      {/* ---- Photos ---- */}
      <section>
        <h2 className="font-display italic text-xl text-foreground">Photos</h2>
        <div className="mt-4 space-y-4">
          {(Object.keys(fieldSchema.maxImagesByRole) as SiteImageRole[]).map((role) => {
            const roleImages = images.filter((img) => img.role === role);
            const max = fieldSchema.maxImagesByRole[role];
            return (
              <div key={role} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{ROLE_LABEL[role]}</span>
                  <span className="text-xs text-foreground/50">
                    {roleImages.length}/{max}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roleImages.map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.url}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover border border-border"
                    />
                  ))}
                  <button
                    type="button"
                    disabled
                    title="Upload de photos bientôt disponible"
                    className="h-20 w-20 rounded-lg border border-dashed border-border text-foreground/30 text-xs cursor-not-allowed"
                  >
                    Bientôt
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        type="submit"
        disabled={isSaving}
        className="px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
      </button>
    </form>
  );
}