export default function ProgramJourney() {
  return (
    <div className="relative space-y-12 before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-soft-green before:via-brand-goldenrod before:to-transparent">
      {/* Step 1 */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white dark:border-brand-charcoal bg-brand-soft-green text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          1
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal">
          <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
            Reserve your spot
          </h4>
          <p className="text-xs font-medium tracking-wide text-brand-soft-green italic mt-1 mb-2">
            During pregnancy or with a newborn
          </p>
          <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/70 leading-relaxed">
            Join at any point — whether you're still pregnant or already in the thick of it with a new baby. We'll match you with your cohort and connect you with a peer via Postpartum Post.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white dark:border-brand-charcoal bg-brand-goldenrod text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          2
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal">
          <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
            Billing starts after your due date
          </h4>
          <p className="text-xs font-medium tracking-wide text-brand-goldenrod italic mt-1 mb-2">
            No charge until your baby arrives
          </p>
          <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/70 leading-relaxed">
            Reserve your spot now without paying. Your first month is billed the month after your due date passes — so you're only paying once you actually need the support.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white dark:border-brand-charcoal bg-brand-soft-green text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          3
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal">
          <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
            Monthly support through your first year
          </h4>
          <p className="text-xs font-medium tracking-wide text-brand-soft-green italic mt-1 mb-2">
            6 months, with the option to extend
          </p>
          <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/70 leading-relaxed">
            Each month brings an expert-led discussion, a local social, and an active community — all alongside your 1:1 peer match and moderated WhatsApp group. We recommend a 3-month minimum to get the most out of it.
          </p>
        </div>
      </div>
    </div>
  );
}
