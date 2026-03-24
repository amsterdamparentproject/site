export default function ProgramJourney() {
  return (
    <div className="relative space-y-12 before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-soft-green before:via-brand-goldenrod before:to-transparent">
      {/* Step 1 */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white dark:border-brand-charcoal bg-brand-soft-green text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          1
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white">
          <h4 className="font-bold text-brand-charcoal">
            Save your family's spot
          </h4>
          <p className="text-xs font-medium tracking-wide text-brand-soft-green italic mt-1 mb-2">
            Up to 8 weeks after birth
          </p>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            Pay the €25 reservation fee to join the program. We’ll begin
            matching you with other families with similar due dates and
            neighborhoods to build a cohort.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white dark:border-brand-charcoal bg-brand-goldenrod text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          2
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white">
          <h4 className="font-bold text-brand-charcoal">The cohort starts</h4>
          <p className="text-xs font-medium tracking-wide text-brand-goldenrod italic mt-1 mb-2">
            4-8 weeks after birth
          </p>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            When your midwife support ends, our program begins! Participate in
            expert-led AMAs, moderated peer discussions, and local socials.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white dark:border-brand-charcoal bg-brand-soft-green text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
          3
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white">
          <h4 className="font-bold text-brand-charcoal">
            Continuous connection
          </h4>
          <p className="text-xs font-medium tracking-wide text-brand-soft-green italic mt-1 mb-2">
            4 months after birth, and beyond
          </p>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            After the program ends, your local expert network and cohort chat
            remain active. Your Amsterdam support system is there for your
            family's ever-evolving needs 🫶🏻
          </p>
        </div>
      </div>
    </div>
  );
}
