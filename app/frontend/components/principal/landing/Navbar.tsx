// ============ frontend/components/principal/landing/Navbar.tsx ============
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

const links = [
  { href: "#modeles", label: "Modèles" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#avis", label: "Avis" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      {/* Se replie au scroll — plus de bandeau qui mange l'espace une fois qu'on est dans le contenu */}
      <div className={`overflow-hidden transition-all duration-300 ${scrolled ? "max-h-0" : "max-h-10"}`}>
        <div className="bg-black text-white text-center text-sm py-2 px-6">
          <span className="sm:hidden">-20% sur Classic ce mois-ci</span>
          <span className="hidden sm:inline">Offre de lancement — 20% de réduction sur le modèle Classic ce mois-ci</span>
        </div>
      </div>

      <header
        className={`transition-all duration-300 border-b ${
          scrolled ? "bg-background/90 backdrop-blur border-border" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center font-display italic transition-colors ${
                scrolled ? "bg-gold/15 text-gold" : "bg-white/15 text-gold backdrop-blur"
              }`}
            >
              S
            </span>
            <span className={`font-display italic text-xl transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>
              Singularity.ci
            </span>
          </Link>

          <nav className={`hidden md:flex items-center gap-8 text-sm transition-colors ${scrolled ? "text-foreground" : "text-white/90"}`}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle variant={scrolled ? "default" : "onImage"} />
            <Link
              href="/register"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                scrolled ? "bg-foreground text-background hover:bg-gold hover:text-foreground" : "bg-white text-black hover:bg-gold"
              }`}
            >
              Créer mon site
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle variant={scrolled ? "default" : "onImage"} />
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className={scrolled ? "text-foreground" : "text-white"}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-background px-6 py-6 flex flex-col gap-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-base text-foreground">
                {link.label}
              </Link>
            ))}
            <Link href="/register" className="mt-2 px-4 py-3 rounded-full bg-foreground text-background text-center font-medium">
              Créer mon site
            </Link>
          </nav>
        )}
      </header>
    </div>
  );
}