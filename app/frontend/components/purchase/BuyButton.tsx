// ============ app/frontend/components/purchase/BuyButton.tsx ============
// Bouton « Acheter » à placer sur chaque carte de template (section Modèles,
// Tarifs, page /apercu/[slug]). Il mène à /payments/checkout/[slug], qui gère lui-même
// la connexion si besoin — le bouton n'a donc pas à savoir si on est connecté.
import Link from "next/link";

interface Props {
  slug: string;
  priceXof?: number;
  className?: string;
  children?: React.ReactNode;
}

export function formatPrice(priceXof: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(priceXof)} FCFA`;
}

export function BuyButton({ slug, priceXof, className, children }: Props) {
  return (
    <Link
      href={`/payments/checkout/${slug}`}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-gold hover:text-foreground transition-colors"
      }
    >
      {children ?? "Acheter"}
      {priceXof !== undefined && <span className="opacity-70">· {formatPrice(priceXof)}</span>}
    </Link>
  );
}