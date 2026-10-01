// ============ frontend/components/landing/Testimonials.tsx ============
const testimonials = [
  {
    quote:
      "On a créé notre site en une pause déjeuner. Nos invités trouvaient le lien tellement élégant qu'ils pensaient qu'on avait payé un développeur.",
    name: "Aïssata & Karim",
    detail: "Mariés à Abidjan, Mars 2026",
  },
  {
    quote:
      "Le compteur RSVP nous a évité des dizaines d'appels pour savoir qui venait. Tout était centralisé, clair, net.",
    name: "Fatou & Ibrahim",
    detail: "Mariés à Yamoussoukro, Février 2026",
  },
  {
    quote:
      "Le paiement en mobile money a tout simplifié. Pas de carte, pas de complications — en dix minutes c'était réglé.",
    name: "Cynthia & Junior",
    detail: "Mariage prévu à Grand-Bassam, Août 2026",
  },
];

export function Testimonials() {
  return (
    <section id="avis" className="max-w-6xl mx-auto px-6 py-28">
      <h2 className="font-display text-3xl md:text-4xl mb-16 max-w-lg">
        Des couples qui ont confié leur grand jour à Singularity.ci
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <figure key={t.name} className="bg-surface rounded-3xl p-8 flex flex-col justify-between">
            <blockquote className="text-lg leading-relaxed">"{t.quote}"</blockquote>
            <figcaption className="mt-8">
              <p className="font-display italic text-wine">{t.name}</p>
              <p className="text-sm text-foreground/60 mt-1">{t.detail}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}