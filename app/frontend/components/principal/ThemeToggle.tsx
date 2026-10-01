// ============ frontend/components/ui/ThemeToggle.tsx (ajout d'un variant) ============
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ variant = "default" }: { variant?: "default" | "onImage" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";
  const styles =
    variant === "onImage"
      ? "border-white/30 text-white hover:border-gold"
      : "border-border text-foreground hover:border-gold";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
      className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${styles}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}