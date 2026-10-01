// hooks/useInView.ts
import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // équivalent de viewport={{ once: true }}
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}