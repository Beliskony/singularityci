// ============ app/(auth)/layout.tsx ============
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Singularity.ci — Connexion",
  description: "Connectez-vous ou créez votre compte pour personnaliser votre site de mariage.",
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}