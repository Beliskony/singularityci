// ============ frontend/components/landing/TemplatesShowcase.tsx ============
import Link from "next/link";

const templates = [
  {
    slug: "classic",
    name: "Classic",
    tagline: "Élégant et intemporel, tons ivoire et or",
    price: "15 000 XOF",
    available: true,
  },
  {
    slug: "floral",
    name: "Floral",
    tagline: "Végétal et romantique, tons sauge",
    price: null,
    available: false,
  },
  {
    slug: "moderne",
    name: "Moderne",
    tagline: "Épuré et graphique, noir et blanc",
    price: null,
    available: false,
  },
];

export function TemplatesShowcase() {
  return (
    <section id="modeles" className="max-w-6xl mx-auto px-6 py-28">
      <div className="max-w-lg mb-16">
        <p className="text-sm tracking-wide text-wine mb-3">Nos modèles</p>
        <h2 className="font-display text-3xl md:text-4xl">
          Chaque design est un vrai site, pas une maquette
        </h2>
        <p className="mt-4 text-foreground/70">
          Ouvrez l'aperçu complet, interagissez avec — c'est exactement ce que verront vos invités.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {templates.map((template) =>
          template.available ? (
            <Link
              key={template.slug}
              href={`/apercu/${template.slug}`}
              target="_blank"
              className="group block rounded-3xl overflow-hidden border border-border bg-surface hover:border-gold transition-colors"
            >
              <div className="aspect-[3/4] relative bg-gradient-to-br from-wine/10 to-gold/10 flex items-center justify-center overflow-hidden">
                <span className="font-display italic text-3xl text-wine">
                  {template.name}
                </span>
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                  <span className="px-4 py-2 rounded-full bg-background text-sm font-medium shadow-lg">
                    Voir l'aperçu complet
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg">{template.name}</p>
                  <p className="text-sm text-foreground/60 mt-0.5">{template.tagline}</p>
                </div>
                <span className="shrink-0 text-sm font-medium px-3 py-1 rounded-full bg-gold/15 text-gold">
                  {template.price}
                </span>
              </div>
            </Link>
          ) : (
            <div
              key={template.slug}
              className="rounded-3xl overflow-hidden border border-dashed border-border"
            >
              <div className="aspect-[3/4] flex items-center justify-center">
                <span className="font-display italic text-2xl text-foreground/30">
                  {template.name}
                </span>
              </div>
              <div className="p-5">
                <p className="font-medium text-foreground/50">{template.name}</p>
                <p className="text-sm text-foreground/40 mt-0.5">Bientôt disponible</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}