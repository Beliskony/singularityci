// ============ frontend/components/landing/Features.tsx ============
const features = [
  { title: "Sous-domaine à vos noms", description: "vosnoms.singularity.ci, prêt à partager." },
  { title: "Compte à rebours en direct", description: "Le décompte jusqu'au grand jour, mis à jour en continu." },
  { title: "Réponses RSVP", description: "Présents, absents, incertains — suivez tout depuis votre tableau de bord." },
  { title: "Mobile money & carte", description: "Paiement sécurisé, adapté à vos habitudes." },
];

export function Features() {
  return (
    <section className="bg-surface py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-x-12 gap-y-10">
        {features.map((f) => (
          <div key={f.title} className="flex gap-4">
            <div className="w-1.5 shrink-0 bg-gold rounded-full" />
            <div>
              <h3 className="font-display text-lg">{f.title}</h3>
              <p className="mt-1 text-foreground/70">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}