// ============ frontend/components/landing/Pricing.tsx ============
export function Pricing() {
  return (
    <section id="tarifs" className="bg-foreground text-background py-24">
      <div className="max-w-md mx-auto px-6 text-center">
        <h2 className="font-display text-3xl">Un tarif simple</h2>
        <p className="mt-3 text-background/70">Valable jusqu'à votre date de mariage. Aucun abonnement caché.</p>
        <div className="mt-10 bg-background/5 border border-background/15 rounded-3xl p-8">
          <p className="font-display text-4xl">15 000 <span className="text-lg">XOF</span></p>
          <p className="mt-2 text-sm text-background/60">Modèle Classic, personnalisation illimitée</p>
          <a href="/register" className="mt-6 inline-block px-6 py-3 rounded-full bg-gold text-foreground font-medium hover:opacity-90 transition-opacity">
            Créer mon site
          </a>
        </div>
      </div>
    </section>
  );
}