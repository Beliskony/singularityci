// ============ frontend/components/principal/landing/Navbar.tsx ============
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

const links = [
  { href: "#modeles", label: "Modèles" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#avis", label: "Avis" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

interface CurrentClient {
  id: string;
  fullName: string;
  email: string;
}

// Hook minimal : interroge /api/client/me pour savoir si un client est connecté.
// Adapte le chemin si ta route a un autre nom.
function useCurrentClient() {
  const [client, setClient] = useState<CurrentClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/client/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setClient(data?.client ?? null);
      })
      .catch(() => {
        if (!cancelled) setClient(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { client, loading, setClient };
}

function UserMenu({
  client,
  scrolled,
  onLoggedOut,
}: {
  client: CurrentClient;
  scrolled: boolean;
  onLoggedOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/client/logout", { method: "POST", credentials: "include" });
    } finally {
      setLoggingOut(false);
      setOpen(false);
      onLoggedOut();
      router.push("/");
      router.refresh();
    }
  }

  const initial = client.fullName?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          scrolled
            ? "bg-foreground/5 text-foreground hover:bg-foreground/10"
            : "bg-white/15 text-white backdrop-blur hover:bg-white/25"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            scrolled ? "bg-gold/20 text-gold" : "bg-white/20 text-white"
          }`}
        >
          {initial}
        </span>
        <span className="max-w-36 truncate">{client.fullName}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg overflow-hidden text-foreground"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium truncate">{client.fullName}</p>
            <p className="text-xs text-foreground/60 truncate">{client.email}</p>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
          >
            <LayoutDashboard size={16} />
            Mon espace
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            role="menuitem"
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            <LogOut size={16} />
            {loggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { client, loading, setClient } = useCurrentClient();

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
            <img src= "/logo/singularity_logo_blanc.png" alt="Singularity.ci" className="w-8 h-8" />
            <span className="font-display italic text-base text-foreground">Singularity</span>
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

            {!loading && client ? (
              <UserMenu client={client} scrolled={scrolled} onLoggedOut={() => setClient(null)} />
            ) : !loading ? (
              <Link
                href="/register"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  scrolled ? "bg-foreground text-background hover:bg-gold hover:text-foreground" : "bg-white text-black hover:bg-gold"
                }`}
              >
                Créer mon site
              </Link>
            ) : (
              // État de chargement court : évite le flash connecté/déconnecté
              <span className={`w-8 h-8 rounded-full animate-pulse ${scrolled ? "bg-foreground/10" : "bg-white/15"}`} />
            )}
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

            {!loading && client ? (
              <>
                <div className="flex items-center gap-3 pt-2">
                  <span className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center text-sm font-semibold">
                    {client.fullName?.trim()?.[0]?.toUpperCase() ?? <User size={16} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{client.fullName}</p>
                    <p className="text-xs text-foreground/60 truncate">{client.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 mt-1 px-4 py-3 rounded-full bg-foreground text-background text-center font-medium justify-center"
                >
                  <LayoutDashboard size={16} />
                  Mon espace
                </Link>
                <button
                  onClick={async () => {
                    await fetch("/api/client/logout", { method: "POST", credentials: "include" });
                    setClient(null);
                    setMobileOpen(false);
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 justify-center"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-full bg-foreground text-background text-center font-medium"
              >
                Créer mon site
              </Link>
            )}
          </nav>
        )}
      </header>
    </div>
  );
}