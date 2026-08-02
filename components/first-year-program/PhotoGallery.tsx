"use client";

import { useState } from "react";
import Image from "@/components/Image";
import PhotoLightbox, {
  PhotoLightboxImage,
} from "@/components/first-year-program/PhotoLightbox";

// ---------------------------------------------------------------------------
// PhotoGallery
//
// Lightweight horizontally-scrolling photo carousel. Uses native CSS scroll
// snap rather than a carousel library, since this is the only place on the
// site that needs one. Clicking a photo opens it enlarged in a lightbox.
// ---------------------------------------------------------------------------

export interface PhotoGalleryItem {
  src: string;
  alt: string;
}

interface PhotoGalleryProps {
  items: PhotoGalleryItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<PhotoLightboxImage | null>(null);

  return (
    <div className="w-full">
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 pb-2 -mx-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelected(item)}
            className="relative shrink-0 snap-start w-[80%] sm:w-[45%] md:w-[31%] aspect-[3/4] rounded-2xl overflow-hidden border border-brand-sand/60 cursor-zoom-in"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 768px) 45vw, 31vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <PhotoLightbox image={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
