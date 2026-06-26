import React, { ReactNode } from "react";

interface HighlightProps {
  icon: string;
  title: string;
  description: ReactNode;
}

const ProgramHighlightBox = ({ icon, title, description }: HighlightProps) => {
  return (
    <div className="p-4 md:p-6 rounded-2xl border border-brand-soft-green dark:border-brand-sand bg-brand-white dark:bg-brand-charcoal transition-all hover:shadow-md h-full">
      <div className="flex flex-col items-center md:flex-col md:items-start gap-2 md:gap-4 md:mb-4">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-goldenrod text-base md:text-lg shrink-0">
          {icon}
        </div>

        <h3 className="font-bold text-sm md:text-xl text-brand-charcoal dark:text-brand-white leading-tight text-center md:text-left">
          {title}
        </h3>
      </div>

      <p className="hidden md:block text-sm leading-relaxed text-brand-soft-charcoal/80 dark:text-brand-white/80">
        {description}
      </p>
    </div>
  );
};

export default ProgramHighlightBox;
