// ============ app/layout.tsx ============
import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import { ThemeProvider } from "@/app/frontend/providers/ThemeProvider";
import { GoogleAuthProvider } from "@/app/frontend/providers/GoogleAuthProvider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Singularity.ci — Sites de mariage personnalisés",
  description: "Créez le site de votre mariage en quelques minutes, en Côte d'Ivoire.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${workSans.variable} antialiased`}
    >
      <body className="flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <GoogleAuthProvider>{children}</GoogleAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}