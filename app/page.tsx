// ============ app/page.tsx ============
import { Navbar } from "@/app/frontend/components/principal/landing/Navbar";
import { Hero } from "@/app/frontend/components/principal/landing/Hero";
import { TrustBar } from "@/app/frontend/components/principal/landing/TrustBar";
import { HowItWorks } from "@/app/frontend/components/principal/landing/HowItWorks";
import { TemplatesShowcase } from "@/app/frontend/components/principal/landing/TemplatesShowcase";
import { Features } from "@/app/frontend/components/principal/landing/Features";
import { Testimonials } from "@/app/frontend/components/principal/landing/Testimonials";
import { Pricing } from "@/app/frontend/components/principal/landing/Pricing";
import { FAQ } from "@/app/frontend/components/principal/landing/FAQ";
import { FinalCTA } from "@/app/frontend/components/principal/landing/FinalCTA";
import { Footer } from "@/app/frontend/components/principal/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <TemplatesShowcase />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}