"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  size = "lg",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label={`Close ${title} modal`}
      />

      {/* Single panel: bottom drawer on mobile, centered modal on desktop */}
      <div className="relative z-10 h-full flex items-end md:items-center justify-center pointer-events-none">
        <div
          className={`pointer-events-auto w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto bg-white dark:bg-brand-soft-charcoal rounded-t-xl md:rounded-xl shadow-xl mx-0 md:mx-4`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-brand-soft-charcoal flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-brand-sand/20">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-brand-charcoal dark:text-brand-goldenrod">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-brand-soft-green dark:text-brand-white">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer text-brand-soft-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod text-xl md:text-3xl"
              aria-label={`Close ${title} dialog`}
            >
              ×
            </button>
          </div>
          {description && (
            <div className="px-4 md:px-6 py-3 text-sm text-brand-soft-charcoal dark:text-brand-sand">
              {description}
            </div>
          )}

          {/* Content */}
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
