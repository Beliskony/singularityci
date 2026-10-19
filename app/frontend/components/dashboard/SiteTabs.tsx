// ============ app/frontend/components/dashboard/SiteTabs.tsx ============
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  siteId: string;
  showPayment: boolean;
  paymentLabel: string;
}

export function SiteTabs({ siteId, showPayment, paymentLabel }: Props) {
  const pathname = usePathname();
  const base = `/dashboard/sites/${siteId}`;

  const tabs = [
    { href: base, label: "Vue d'ensemble", exact: true },
    { href: `${base}/personnaliser`, label: "Personnaliser" },
    { href: `${base}/invites`, label: "Invités" },
    ...(showPayment ? [{ href: `${base}/payer`, label: paymentLabel }] : []),
  ];

  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border -mb-px" aria-label="Sections du site">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active ? "border-gold text-gold" : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}