// ============ app/apercu/[slug]/page.tsx ============
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTemplateComponent } from "@/app/frontend/components/templates/registry";

const DEMO_PROPS = {
  groomName: "Junior",
  brideName: "Cynthia",
  eventDate: new Date("2026-08-28"),
  heroImage: "/templates/classic/demo-hero.jpg",
  galleryImages: [
    "/templates/classic/demo-gallery-1.jpg",
    "/templates/classic/demo-gallery-2.jpg",
    "/templates/classic/demo-gallery-3.jpg",
    "/templates/classic/demo-gallery-4.jpg",
  ],
  venueImages: [
    "/templates/classic/demo-venue-1.jpg",
    "/templates/classic/demo-venue-2.jpg",
  ],
  themeColors: { primary: "#C9A227", background: "#FFF8E7" },
  customTexts: {
    welcomeMessage: "Nous vous invitons à partager ce moment unique de notre vie.",
    venue: "Complexe hôtelier La Fourchette de Roze",
    rsvpDeadline: "avant le 20 août",
  },
  programItems: [
    { time: "08:00", label: "Accueil des invités" },
    { time: "09:30", label: "Cérémonie religieuse" },
    { time: "12:00", label: "Cocktail" },
    { time: "18:00", label: "Soirée dansante" },
  ],
  rsvpCount: 128,
  onSubmitRsvp: async () => {
    // Aperçu de démonstration : aucune vraie soumission n'a lieu ici
  },
};

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let TemplateComponent;
  try {
    TemplateComponent = getTemplateComponent(slug);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="sticky top-0 z-50 bg-foreground text-background text-sm px-6 py-3 flex items-center justify-between">
        <span>Aperçu du modèle « {slug} » — ceci n'est pas un vrai site</span>
        <Link href="/register" className="underline font-medium">
          Créer le mien
        </Link>
      </div>
      <TemplateComponent {...DEMO_PROPS} />
    </div>
  );
}