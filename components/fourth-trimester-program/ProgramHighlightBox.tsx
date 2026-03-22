import React from "react";

interface HighlightProps {
  icon: string;
  title: string;
  description: string;
}

const ProgramHighlightBox = ({ icon, title, description }: HighlightProps) => {
  return (
    <div className="p-6 rounded-2xl border border-brand-soft-green dark:border-brand-sand bg-brand-white dark:bg-brand-charcoal transition-all hover:shadow-md h-full">
      <div className="flex flex-row md:flex-col items-center md:items-start gap-4 mb-4">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-goldenrod text-base md:text-lg shrink-0">
          {icon}
        </div>

        <h3 className="font-bold text-lg md:text-xl text-brand-charcoal dark:text-brand-white leading-tight">
          {title}
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-brand-soft-charcoal/80 text-brand-white/80">
        {description}
      </p>
    </div>
  );
};

export default ProgramHighlightBox;
