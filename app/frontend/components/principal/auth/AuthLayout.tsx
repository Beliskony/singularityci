// ============ frontend/components/principal/auth/AuthLayout.tsx ============
import Link from "next/link";
import { ReactNode } from "react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-dvh grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-foreground text-background p-12">
        <Link href="/" className="font-display italic text-xl">
          Singularity<span className="text-gold">.ci</span>
        </Link>

        <div className="bg-background/5 border border-background/15 rounded-4xl p-8">
          <p className="text-xs tracking-wide text-background/50">cynthia-junior.singularity.ci</p>
          <p className="font-display italic text-2xl mt-6 text-gold">Cynthia &amp; Junior</p>
          <p className="mt-2 text-background/60 text-sm">28 Août 2026 · Grand-Bassam</p>
          <div className="mt-6 pt-6 border-t border-background/15 flex items-center justify-between text-sm">
            <span className="text-background/60">128 invités ont confirmé</span>
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium">RSVP ouvert</span>
          </div>
        </div>

        <p className="text-sm text-background/50">
          Des sites de mariage élégants, pensés pour la Côte d'Ivoire.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 md:px-16">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/" className="md:hidden font-display italic text-xl mb-10 block">
            Singularity<span className="text-gold">.ci</span>
          </Link>
          <h1 className="font-display text-3xl">{title}</h1>
          <p className="mt-2 text-foreground/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}