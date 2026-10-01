// ============ frontend/components/landing/FAQ.tsx ============
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Que se passe-t-il après la date de mon mariage ?",
    answer:
      "Votre site reste consultable pendant 7 jours après l'événement, le temps de récupérer vos souvenirs. Passé ce délai, les photos que vous avez ajoutées sont supprimées et le site est archivé.",
  },
  {
    question: "Puis-je changer la date après avoir payé ?",
    answer:
      "La date est verrouillée après paiement, car elle détermine la durée de validité de votre site. En cas de report, contactez-nous — nous traitons ces cas au cas par cas.",
  },
  {
    question: "Le mobile money est-il vraiment sécurisé ?",
    answer:
      "Oui, chaque transaction passe par un prestataire de paiement certifié. Nous ne stockons jamais vos identifiants mobile money ou vos numéros de carte.",
  },
  {
    question: "Puis-je changer de modèle après l'achat ?",
    answer:
      "Le modèle choisi à l'achat reste fixe. Vous pouvez en revanche personnaliser librement les couleurs, textes, photos et le programme du jour.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface py-28">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-display text-3xl md:text-4xl mb-12">Questions fréquentes</h2>
        <div className="divide-y divide-border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="py-6">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left gap-4"
                >
                  <span className="font-display text-lg">{faq.question}</span>
                  <Plus
                    size={20}
                    className={`shrink-0 text-gold transition-transform ${isOpen ? "rotate-45" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-4 text-foreground/70 leading-relaxed max-w-xl">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}