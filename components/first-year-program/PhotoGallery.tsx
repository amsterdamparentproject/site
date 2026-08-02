"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "@/components/Image";
import PhotoLightbox, {
  PhotoLightboxImage,
} from "@/components/first-year-program/PhotoLightbox";

// ---------------------------------------------------------------------------
// PhotoGallery
//
// Lightweight horizontally-scrolling photo carousel. Uses native CSS scroll
// snap rather than a carousel library, since this is the only place on the
// site that needs one. Shows exactly 2 cards per view on mobile (so every
// card is the same height/position, no matter how many photos are in the
// set) and reveals additional photos via swipe or the arrow buttons.
// Clicking a photo opens it enlarged in a lightbox.
// ---------------------------------------------------------------------------

export interface PhotoGalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

interface PhotoGalleryProps {
  items: PhotoGalleryItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<PhotoLightboxImage | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [items, updateEdges]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const showArrows = items.length > 2;

  return (
    <div className="w-full relative">
      <div
        ref={scrollerRef}
        onScroll={updateEdges}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 pb-2 -mx-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelected(item)}
            className="relative shrink-0 snap-start w-[calc(50%-0.5rem)] sm:w-[45%] md:w-[31%] aspect-[3/4] rounded-2xl overflow-hidden border border-brand-sand/60 cursor-zoom-in"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 45vw, 31vw"
              className="object-cover"
            />
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[11px] leading-snug italic px-2 py-1.5 text-left">
                {item.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label="Previous photos"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-brand-charcoal/90 border border-brand-sand/60 shadow disabled:opacity-0 disabled:pointer-events-none transition-opacity"
          >
            <ChevronLeft
              size={18}
              className="text-brand-charcoal dark:text-brand-white"
            />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label="Next photos"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-brand-charcoal/90 border border-brand-sand/60 shadow disabled:opacity-0 disabled:pointer-events-none transition-opacity"
          >
            <ChevronRight
              size={18}
              className="text-brand-charcoal dark:text-brand-white"
            />
          </button>
        </>
      )}

      <PhotoLightbox image={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
