// ============ frontend/components/landing/Footer.tsx ============
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const columns = [
  {
    title: "Produit",
    links: [
      { href: "#modeles", label: "Modèles" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#comment-ca-marche", label: "Comment ça marche" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "#faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/remboursement", label: "Politique de remboursement" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/cgu", label: "Conditions d'utilisation" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12">
        <div>
          <p className="font-display italic text-xl">Singularity.ci</p>
          <p className="mt-3 text-sm text-foreground/60 max-w-xs">
            Des sites de mariage élégants, personnalisés en quelques minutes, pensés pour la Côte d'Ivoire.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Instagram" className="text-foreground/60 hover:text-gold transition-colors">
              {/*<Instagram size={18} />*/}
            </a>
            <a href="#" aria-label="Facebook" className="text-foreground/60 hover:text-gold transition-colors">
             {/* <Facebook size={18} /> */}
            </a>
            <a href="#" aria-label="WhatsApp" className="text-foreground/60 hover:text-gold transition-colors">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-medium mb-4">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-foreground/60 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-foreground/50">
          <p>© 2026 Singularity.ci — Grand-Bassam, Côte d'Ivoire</p>
          <p>Fait avec soin pour vos plus beaux jours</p>
        </div>
      </div>
    </footer>
  );
}