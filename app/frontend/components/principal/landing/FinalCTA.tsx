// ============ frontend/components/landing/FinalCTA.tsx ============
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-28 text-center">
      <h2 className="font-display text-4xl md:text-5xl leading-tight">
        Votre histoire mérite un site à sa hauteur
      </h2>
      <p className="mt-6 text-foreground/70 max-w-md mx-auto">
        Choisissez un modèle, personnalisez-le à votre image, partagez-le en quelques minutes.
      </p>
      <Link
        href="/register"
        className="mt-10 inline-block px-8 py-4 rounded-full bg-wine text-background font-medium hover:opacity-90 transition-opacity"
      >
        Créer mon site
      </Link>
    </section>
  );
}