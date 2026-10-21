// ============ app/frontend/components/dashboard/PersonnalisationStudio.tsx ============
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ISite, ISiteImage, SiteStatus, SiteImageRole, IProgramItem } from "@/app/server/sites/ISite";
import { TemplateFieldSchema } from "@/app/frontend/types/TemplateFielSchemas";
import type { LivePreviewData } from "../../types/LivePreviewData";
import { ColorPicker } from "./ColorPicker";
import { ImagePicker, ImagePreset } from "./ImagePicker";
import { TemplateLivePreview } from "./TemplateLivePreview";

interface Props {
  site: ISite;
  images: ISiteImage[];
  fieldSchema: TemplateFieldSchema;
  templateSlug: string;
}

// Les champs « image » sont des champs texte dont la valeur est une URL.
// `kind` et `presets` sont optionnels dans le schéma (cf. patch TemplateFielSchemas).
type TextField = TemplateFieldSchema["textFields"][number] & { kind?: "text" | "image"; presets?: ImagePreset[] };
const isImageField = (f: TextField) => f.kind === "image" || /Url$/.test(f.key);

const GROUP_LABEL: Record<string, string> = {
  general: "Général",
  hero: "Accueil",
  welcome: "Bienvenue",
  calendar: "Calendrier",
  first: "Accueil",
  second: "Calendrier",
  third: "Lieu",
  program: "Programme",
  gallery: "Galerie",
  venue: "Lieu",
  rsvp: "Confirmation",
  footer: "Pied de page",
};

// "welcomeBg" → groupe "welcome" ; "primary" (sans majuscule) → "general".
function colorGroup(key: string): string {
  const m = key.match(/^[a-z0-9]+(?=[A-Z])/);
  return m ? m[0] : "general";
}

const ROLE_LABEL: Record<SiteImageRole, string> = {
  [SiteImageRole.HERO]: "Photo principale",
  [SiteImageRole.GALLERY]: "Galerie",
  [SiteImageRole.VENUE]: "Lieu de réception",
};

type SectionId = "infos" | "colors" | "texts" | "illustrations" | "program" | "photos";

const toDateInput = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

export function PersonnalisationStudio({ site, images, fieldSchema, templateSlug }: Props) {
  const router = useRouter();
  const eventDateLocked = site.status === SiteStatus.ACTIVE;

  const textFields = fieldSchema.textFields as TextField[];
  const plainTextFields = textFields.filter((f) => !isImageField(f));
  const imageFields = textFields.filter(isImageField);
  const maxProgramItems = fieldSchema.maxProgramItems ?? 0;

  const [groomName, setGroomName] = useState(site.groomName);
  const [brideName, setBrideName] = useState(site.brideName);
  const [eventDate, setEventDate] = useState(toDateInput(site.eventDate));
  const [themeColors, setThemeColors] = useState<Record<string, string>>(() =>
    Object.fromEntries(fieldSchema.colorFields.map((f) => [f.key, site.themeColors?.[f.key] ?? f.defaultValue]))
  );
  // Image : "" = image d'origine ; texte : valeur courante (défaut si jamais modifié).
  const [customTexts, setCustomTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      textFields.map((f) => [f.key, site.customTexts?.[f.key] ?? (isImageField(f) ? "" : f.defaultValue)])
    )
  );
  const [programItems, setProgramItems] = useState<IProgramItem[]>(site.programItems ?? []);

  const [section, setSection] = useState<SectionId>("infos");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoDrafts, setPhotoDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ---- Sections disponibles selon ce que le template expose ----
  const sections = useMemo(() => {
    const list: { id: SectionId; label: string }[] = [{ id: "infos", label: "Informations" }];
    if (fieldSchema.colorFields.length) list.push({ id: "colors", label: "Couleurs" });
    if (plainTextFields.length) list.push({ id: "texts", label: "Textes" });
    if (imageFields.length) list.push({ id: "illustrations", label: "Illustrations" });
    if (maxProgramItems > 0) list.push({ id: "program", label: "Programme" });
    list.push({ id: "photos", label: "Photos" });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldSchema]);

  // ---- Payload : on n'envoie que ce qui diffère du template ----
  // updateCustomization remplace themeColors / customTexts en bloc : envoyer
  // uniquement les écarts permet à un champ remis à sa valeur d'origine de
  // retomber automatiquement sur le défaut du template.
  const diffColors = useMemo(
    () =>
      Object.fromEntries(
        fieldSchema.colorFields
          .filter((f) => themeColors[f.key] && themeColors[f.key].toLowerCase() !== f.defaultValue.toLowerCase())
          .map((f) => [f.key, themeColors[f.key]])
      ),
    [themeColors, fieldSchema]
  );
  const diffTexts = useMemo(
    () =>
      Object.fromEntries(
        textFields
          .filter((f) => {
            const v = (customTexts[f.key] ?? "").trim();
            return v !== "" && v !== f.defaultValue;
          })
          .map((f) => [f.key, customTexts[f.key].trim()])
      ),
    [customTexts, textFields]
  );
  const cleanProgram = useMemo(() => programItems.filter((p) => p.time.trim() && p.label.trim()), [programItems]);

  const snapshot = JSON.stringify({ groomName, brideName, eventDate, diffColors, diffTexts, cleanProgram });
  const savedRef = useRef(snapshot);
  const dirty = snapshot !== savedRef.current;

  // Prévient avant de quitter la page avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ---- Données de l'aperçu ----
  const previewData: LivePreviewData = useMemo(
    () => ({
      groomName,
      brideName,
      eventDate,
      themeColors: diffColors, // le template applique lui-même ses défauts
      customTexts: Object.fromEntries(Object.entries(customTexts).filter(([, v]) => v !== "")),
      programItems: cleanProgram,
      heroImage: images.find((i) => i.role === SiteImageRole.HERO)?.url,
      galleryImages: images.filter((i) => i.role === SiteImageRole.GALLERY).sort((a, b) => a.position - b.position).map((i) => i.url),
      venueImages: images.filter((i) => i.role === SiteImageRole.VENUE).sort((a, b) => a.position - b.position).map((i) => i.url),
    }),
    [groomName, brideName, eventDate, diffColors, customTexts, cleanProgram, images]
  );

  async function save() {
    setSaving(true);
    setFeedback(null);

    const payload: Record<string, unknown> = {
      groomName,
      brideName,
      themeColors: diffColors,
      customTexts: diffTexts,
      programItems: cleanProgram,
    };
    // Refusée par le serveur une fois le site payé (CANNOT_CHANGE_EVENT_DATE_AFTER_PAYMENT).
    if (!eventDateLocked) payload.eventDate = eventDate;

    try {
      const res = await fetch(`/api/client/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code: string = data.error ?? "SAVE_FAILED";
        setFeedback({
          type: "error",
          message: code.startsWith("SITE_NOT_EDITABLE")
            ? "Ce site n'est plus modifiable."
            : code === "VALIDATION_ERROR"
            ? "Certaines valeurs sont invalides (vérifiez les noms et la date)."
            : code.startsWith("TEXT_FIELD_TOO_LONG")
            ? "Un des textes est trop long."
            : code.startsWith("INVALID_IMAGE_URL")
            ? "Un lien d'image est invalide (il doit commencer par https://)."
            : "Une erreur est survenue, réessayez.",
        });
        return;
      }
      savedRef.current = snapshot;
      setFeedback({ type: "success", message: "Modifications enregistrées." });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Impossible de contacter le serveur." });
    } finally {
      setSaving(false);
    }
  }

  // ---- Photos (liens https:// tant que l'import de fichiers n'est pas branché) ----
  async function addPhoto(role: SiteImageRole) {
    const url = (photoDrafts[role] ?? "").trim();
    if (!/^https:\/\//i.test(url)) return setPhotoError("Le lien doit commencer par https://");
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const res = await fetch(`/api/client/sites/${site.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code: string = data.error ?? "";
        return setPhotoError(
          code.startsWith("MAX_IMAGES_REACHED") ? "Nombre maximum de photos atteint." : "Impossible d'ajouter cette photo."
        );
      }
      setPhotoDrafts((p) => ({ ...p, [role]: "" }));
      router.refresh(); // recharge les photos → l'aperçu se met à jour
    } catch {
      setPhotoError("Impossible de contacter le serveur.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto(imageId: string) {
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const res = await fetch(`/api/client/sites/${site.id}/images?imageId=${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return setPhotoError("Impossible de retirer cette photo.");
      router.refresh();
    } catch {
      setPhotoError("Impossible de contacter le serveur.");
    } finally {
      setPhotoBusy(false);
    }
  }

  // ---- Programme ----
  const addProgramItem = () => programItems.length < maxProgramItems && setProgramItems([...programItems, { time: "", label: "" }]);
  const updateProgramItem = (i: number, patch: Partial<IProgramItem>) =>
    setProgramItems(programItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeProgramItem = (i: number) => setProgramItems(programItems.filter((_, idx) => idx !== i));

  // ---- Couleurs groupées ----
  const colorGroups = useMemo(() => {
    const groups = new Map<string, typeof fieldSchema.colorFields>();
    for (const f of fieldSchema.colorFields) {
      const g = colorGroup(f.key);
      groups.set(g, [...(groups.get(g) ?? []), f]);
    }
    return [...groups.entries()];
  }, [fieldSchema]);

  const inputCls = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* ================= Éditeur ================= */}
      <div className="min-w-0">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                section === s.id ? "bg-gold/15 text-gold" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-6">
          {section === "infos" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-foreground/60">Prénom du marié</span>
                <input value={groomName} onChange={(e) => setGroomName(e.target.value)} maxLength={60} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-sm text-foreground/60">Prénom de la mariée</span>
                <input value={brideName} onChange={(e) => setBrideName(e.target.value)} maxLength={60} className={inputCls} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm text-foreground/60">Date de l&apos;événement</span>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} disabled={eventDateLocked} className={`${inputCls} disabled:opacity-50`} />
                {eventDateLocked && (
                  <span className="mt-1 block text-xs text-foreground/50">
                    Cette date correspond à la fin de votre abonnement : elle ne peut plus être changée une fois le site payé.
                  </span>
                )}
              </label>
            </div>
          )}

          {section === "colors" &&
            colorGroups.map(([group, fields]) => (
              <fieldset key={group} className="rounded-2xl border border-border p-5 space-y-5">
                <legend className="px-2 font-display italic text-lg text-foreground">
                  {GROUP_LABEL[group] ?? group.charAt(0).toUpperCase() + group.slice(1)}
                </legend>
                {fields.map((f) => (
                  <ColorPicker
                    key={f.key}
                    label={f.label}
                    value={themeColors[f.key]}
                    defaultValue={f.defaultValue}
                    onChange={(hex) => setThemeColors((prev) => ({ ...prev, [f.key]: hex }))}
                  />
                ))}
              </fieldset>
            ))}

          {section === "texts" &&
            plainTextFields.map((f) => (
              <label key={f.key} className="block">
                <span className="flex items-center justify-between text-sm text-foreground/60">
                  {f.label}
                  <span>
                    {(customTexts[f.key] ?? "").length}/{f.maxLength}
                  </span>
                </span>
                <textarea
                  value={customTexts[f.key] ?? ""}
                  onChange={(e) => setCustomTexts((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  maxLength={f.maxLength}
                  rows={f.maxLength > 80 ? 3 : 1}
                  className={inputCls}
                />
                {customTexts[f.key] !== f.defaultValue && (
                  <button
                    type="button"
                    onClick={() => setCustomTexts((prev) => ({ ...prev, [f.key]: f.defaultValue }))}
                    className="mt-1 text-xs text-foreground/50 hover:text-gold"
                  >
                    Texte d&apos;origine
                  </button>
                )}
              </label>
            ))}

          {section === "illustrations" &&
            imageFields.map((f) => (
              <div key={f.key} className="rounded-2xl border border-border p-5">
                <ImagePicker
                  label={f.label}
                  value={customTexts[f.key] ?? ""}
                  defaultValue={f.defaultValue}
                  presets={f.presets}
                  onChange={(url) => setCustomTexts((prev) => ({ ...prev, [f.key]: url }))}
                />
              </div>
            ))}

          {section === "program" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60">
                  {programItems.length}/{maxProgramItems} étapes
                </p>
                <button type="button" onClick={addProgramItem} disabled={programItems.length >= maxProgramItems} className="text-sm text-gold hover:underline disabled:opacity-40 disabled:no-underline">
                  + Ajouter une étape
                </button>
              </div>
              {programItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={item.time} onChange={(e) => updateProgramItem(i, { time: e.target.value })} placeholder="08:00" maxLength={10} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
                  <input value={item.label} onChange={(e) => updateProgramItem(i, { label: e.target.value })} placeholder="Accueil des invités" maxLength={100} className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
                  <button type="button" onClick={() => removeProgramItem(i)} className="px-2 text-foreground/40 hover:text-red-600" aria-label="Supprimer cette étape">
                    ✕
                  </button>
                </div>
              ))}
              {programItems.length === 0 && <p className="text-sm text-foreground/50">Aucune étape pour l&apos;instant.</p>}
            </div>
          )}

          {section === "photos" && (
            <div className="space-y-4">
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
                        <div key={img.id} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
                          <button
                            type="button"
                            disabled={photoBusy}
                            onClick={() => removePhoto(img.id)}
                            aria-label="Retirer cette photo"
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground text-background text-xs leading-none hover:bg-red-600 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {roleImages.length < max && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={photoDrafts[role] ?? ""}
                          onChange={(e) => setPhotoDrafts((p) => ({ ...p, [role]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto(role))}
                          placeholder="https://… lien de la photo"
                          className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <button
                          type="button"
                          disabled={photoBusy}
                          onClick={() => addPhoto(role)}
                          className="px-3 py-2 rounded-lg bg-foreground text-background text-sm hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          Ajouter
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {photoError && <p className="text-sm text-red-600">{photoError}</p>}
              <p className="text-xs text-foreground/50">
                Collez le lien https:// d&apos;une photo déjà en ligne. L&apos;import depuis votre appareil arrive bientôt.
              </p>
            </div>
          )}
        </div>

        {/* Barre d'enregistrement */}
        <div className="sticky bottom-0 mt-8 -mx-2 px-2 py-3 bg-background/90 backdrop-blur border-t border-border flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setMobilePreview(true)}
            className="lg:hidden px-5 py-2.5 rounded-full border border-border text-sm text-foreground"
          >
            Aperçu
          </button>
          {dirty && !feedback && <span className="text-xs text-amber-600">Modifications non enregistrées</span>}
          {feedback && (
            <span className={`text-sm ${feedback.type === "success" ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>
              {feedback.message}
            </span>
          )}
        </div>
      </div>

      {/* ================= Aperçu (une seule iframe, jamais démontée) ================= */}
      <div
        className={
          mobilePreview
            ? "fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4 lg:static lg:block lg:p-0 lg:z-auto"
            : "hidden lg:block"
        }
      >
        {mobilePreview && (
          <button type="button" onClick={() => setMobilePreview(false)} className="lg:hidden mb-3 px-5 py-2 rounded-full bg-foreground text-background text-sm">
            ← Retour à l&apos;édition
          </button>
        )}
        <div className="lg:sticky lg:top-6">
          <TemplateLivePreview slug={templateSlug} data={previewData} />
        </div>
      </div>
    </div>
  );
}