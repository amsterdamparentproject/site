"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label={`Close ${title} modal`}
        />

        {/* Mobile: Drawer from bottom */}
        <div className="md:hidden absolute inset-x-0 bottom-0 flex items-end justify-center">
          <div className="w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-brand-soft-charcoal rounded-t-xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-brand-sand/20">
              <div>
                <h2 className="text-lg font-bold text-brand-charcoal dark:text-brand-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-brand-soft-green dark:text-brand-goldenrod">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer text-brand-soft-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod text-xl"
                aria-label={`Close ${title} dialog`}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4">{children}</div>
          </div>
        </div>

        {/* Desktop: Centered modal */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center">
          <div
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto bg-white dark:bg-brand-soft-charcoal rounded-xl shadow-xl mx-4`}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-brand-soft-charcoal flex items-center justify-between px-6 py-4 border-b border-brand-sand/20">
              <div>
                <h2 className="text-xl font-bold text-brand-charcoal dark:text-brand-goldenrod">
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
                className="cursor-pointer text-brand-soft-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod text-3xl"
                aria-label={`Close ${title} dialog`}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
