"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook IntersectionObserver auto-contenu (même pattern que Classic/Éclat) :
 * chaque template garde sa propre copie pour rester 100% indépendant
 * (pas de fichier partagé, décision explicite du projet).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options ?? { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}
