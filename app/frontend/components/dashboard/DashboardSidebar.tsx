// ============ frontend/components/dashboard/DashboardSidebar.tsx ============
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, LogOut, Menu, X } from "lucide-react";

interface Props {
  client: { fullName: string; email: string };
}

const navItems = [{ href: "/dashboard", label: "Mes sites", icon: LayoutGrid }];

export function DashboardSidebar({ client }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/client/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  const initial = client.fullName?.trim()?.[0]?.toUpperCase() ?? "?";

  const content = (
    <div className="flex flex-col h-full">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <span className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center font-display italic text-sm">
          S
        </span>
        <span className="font-display italic text-lg text-foreground">Singularity.ci</span>
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-gold/15 text-gold" : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        {/* Pas de lien "Choisir un template" ici : le CTA existe déjà en
            haut de /dashboard, pas besoin de le dupliquer dans la sidebar. */}
      </nav>

      <div className="border-t border-border px-3 py-4 space-y-1">
        <Link
          href="/dashboard/account"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-semibold shrink-0">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{client.fullName}</p>
            <p className="text-xs text-foreground/50 truncate">{client.email}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-background shrink-0">
        {content}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center font-display italic text-xs">
            S
          </span>
          <span className="font-display italic text-base text-foreground">Singularity.ci</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} aria-label="Menu" className="text-foreground">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-72 bg-background h-full">
            <div className="flex justify-end px-3 pt-3">
              <button onClick={() => setMobileOpen(false)} aria-label="Fermer" className="text-foreground">
                <X size={22} />
              </button>
            </div>
            {content}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}