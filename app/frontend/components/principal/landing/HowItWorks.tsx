// ============ frontend/components/landing/HowItWorks.tsx ============
const steps = [
  { number: "1", title: "Choisissez votre modèle", description: "Parcourez nos designs et sélectionnez celui qui vous ressemble." },
  { number: "2", title: "Personnalisez chaque détail", description: "Vos noms, vos photos, votre date, vos couleurs, votre lieu — tout est modifiable." },
  { number: "3", title: "Payez et partagez", description: "Mobile money ou carte. Votre lien est prêt à envoyer dans la minute." },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="font-display text-3xl md:text-4xl text-center mb-16">Comment ça marche</h2>
      <div className="grid md:grid-cols-3 gap-12">
        {steps.map((step) => (
          <div key={step.number}>
            <span className="font-display text-2xl text-gold">{step.number}</span>
            <h3 className="font-display text-xl mt-3">{step.title}</h3>
            <p className="mt-2 text-foreground/70">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}