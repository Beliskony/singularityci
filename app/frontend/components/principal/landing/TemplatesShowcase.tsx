// ============ frontend/components/principal/landing/TemplatesShowcase.tsx ============
import Link from "next/link";
import Image from "next/image";
import { getTemplateService } from "@/app/server/templates/template.container";
import { getTemplateCover } from "@/app/frontend/components/templates/registry";

function formatPrice(xof: number): string {
  return new Intl.NumberFormat("fr-FR").format(xof) + " XOF";
}

const comingSoon = [
  { name: "Floral", tagline: "Végétal et romantique, tons sauge" },
  { name: "Moderne", tagline: "Épuré et graphique, noir et blanc" },
];

export async function TemplatesShowcase() {
  const templateService = getTemplateService();
  const templates = await templateService.listActiveTemplates();

  return (
    <section id="modeles" className="max-w-6xl mx-auto px-6 py-28">
      <div className="max-w-lg mb-16">
        <p className="text-sm tracking-wide text-gold mb-3">Nos modèles</p>
        <h2 className="font-display text-3xl md:text-4xl">
          Chaque design est un vrai site, pas une maquette
        </h2>
        <p className="mt-4 text-foreground/70">
          Ouvrez l'aperçu complet, interagissez avec — c'est exactement ce que verront vos invités.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {templates.map((template) => {
          const cover = getTemplateCover(template.slug);

          return (
            <Link
              key={template.id}
              href={`/apercu/${template.slug}`}
              target="_blank"
              className="group block rounded-3xl overflow-hidden border border-border bg-surface hover:border-gold transition-colors"
            >
              <div className="aspect-3/4 relative overflow-hidden bg-background">
                {cover && (
                  <Image
                    src={cover}
                    alt={template.name}
                    fill
                    placeholder="blur" // gratuit avec un import statique Next, flou pendant le chargement
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                  <span className="px-4 py-2 rounded-full bg-background text-sm font-medium shadow-lg">
                    Voir et manipuler l'aperçu
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg">{template.name}</p>
                  {template.description && (
                    <p className="text-sm text-foreground/60 mt-0.5 line-clamp-2">{template.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-medium px-3 py-1 rounded-full bg-gold/15 text-gold">
                  {formatPrice(template.price)}
                </span>
              </div>
            </Link>
          );
        })}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 text-foreground/50 text-sm">
            Aucun modèle publié pour l'instant — ajoute une ligne dans la table <code>templates</code>.
          </div>
        )}

        {comingSoon.map((t) => (
          <div key={t.name} className="rounded-3xl overflow-hidden border border-dashed border-border">
            <div className="aspect-3/4 flex items-center justify-center">
              <span className="font-display italic text-2xl text-foreground/30">{t.name}</span>
            </div>
            <div className="p-5">
              <p className="font-medium text-foreground/50">{t.name}</p>
              <p className="text-sm text-foreground/40 mt-0.5">{t.tagline} — Bientôt disponible</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}