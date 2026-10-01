// ============ frontend/components/landing/TrustBar.tsx ============
const stats = [
  { value: "3 min", label: "pour créer votre site" },
  { value: "100%", label: "sécurisé, paiement chiffré" },
  { value: "24/7", label: "votre site reste accessible" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-2xl md:text-3xl text-gold">{s.value}</p>
            <p className="text-sm text-foreground/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}