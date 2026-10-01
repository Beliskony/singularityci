// ============ frontend/components/principal/landing/Hero.tsx ============
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-end overflow-hidden">
      {/* Photo de fond — remplace par une vraie image dans /public/landing/hero-couple.jpg */}
      <Image
        src="/landing/hero-couple.jpg"
        alt="Couple le jour de leur mariage"
        fill
        priority
        className="object-cover object-top"
      />

      {/* Double dégradé pour garder le texte lisible quelle que soit la photo utilisée */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 pt-40 w-full grid md:grid-cols-[1.3fr_1fr] gap-12 items-end">
        <div>

          <h1 className="font-display text-5xl md:text-7xl leading-[1.02] text-white">
            Votre mariage mérite
            <br />
            <span className="text-gold italic">plus</span> qu'un message WhatsApp
          </h1>

          <p className="mt-6 text-lg text-white/80 max-w-md">
            Un site personnalisé avec vos noms, vos photos et votre date — vos invités
            confirment leur présence en un clic, où qu'ils soient.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-full bg-gold text-black font-medium hover:opacity-90 transition-opacity"
            >
              Créer mon site
            </Link>
            <Link
              href="#modeles"
              className="px-7 py-3.5 rounded-full border border-white/30 text-white font-medium hover:border-white transition-colors"
            >
              Voir les modèles
            </Link>
          </div>
        </div>

        {/* Carte d'invitation flottante, effet verre */}
        <div className="hidden md:block bg-white/10 backdrop-blur-xl border border-white/20 rounded-4 p-4 text-white shadow-2xl">
          <p className="text-xs tracking-wide text-white/50">cynthia-junior.singularity.ci</p>
          <p className="font-display italic text-2xl mt-5 text-gold">Cynthia &amp; Junior</p>
          <p className="mt-1 text-white/70 text-sm">28 Août 2026 · Grand-Bassam</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-3xl text-gold">46</span>
            <span className="text-sm text-white/60">jours restants</span>
          </div>

          <div className="mt-5 pt-5 border-t border-white/15 flex items-center justify-between text-sm">
            <span className="text-white/60">128 confirmés</span>
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium">RSVP ouvert</span>
          </div>
        </div>
      </div>

    </section>
  );
}