"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import Image from "@/components/Image";

// ---------------------------------------------------------------------------
// PhotoLightbox
//
// Fullscreen, dismissable overlay showing an enlarged photo. Closes on
// backdrop click, close button, or Escape.
// ---------------------------------------------------------------------------

export interface PhotoLightboxImage {
  src: string;
  alt: string;
}

interface PhotoLightboxProps {
  image: PhotoLightboxImage | null;
  onClose: () => void;
}

export default function PhotoLightbox({ image, onClose }: PhotoLightboxProps) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-black/85 cursor-zoom-out"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>
      <div className="relative z-10 w-full h-full max-w-5xl max-h-[85vh]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
