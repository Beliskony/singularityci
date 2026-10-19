"use client";

import { useInView } from "../hooks/useInView";

interface Props {
  galleryImages: string[];
  themeColors?: Record<string, string>;
}

export default function GallerySection({ galleryImages, themeColors = {} }: Props) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  if (!galleryImages || galleryImages.length === 0) return null;

  const bg = themeColors.galleryBg ?? "#f4ead9";
  const titleColor = themeColors.galleryTitleColor ?? "#4a0e1a";

  return (
    <section className="w-full px-6 py-20" style={{ backgroundColor: bg }}>
      <div ref={ref} className={`fl-reveal mx-auto max-w-md ${isInView ? "fl-in" : ""}`}>
        <h3 className="text-center font-script text-3xl" style={{ color: titleColor }}>
          Nos instants
        </h3>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {galleryImages.slice(0, 4).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Photo ${i + 1}`}
              className={`aspect-3/4 w-full rounded-sm object-cover ${i === 0 ? "col-span-2 aspect-16/9" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
