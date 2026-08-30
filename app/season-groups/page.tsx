import { genPageMetadata } from "app/seo";
import ShowcaseButton from "@/components/ShowcaseButton";
import SeasonGroupSignupForm from "@/components/season-groups/SeasonGroupSignupForm";

export const metadata = genPageMetadata({
  title: "Season Groups",
  description:
    "Join your free, private WhatsApp community of expecting families in Amsterdam due around the same time as you.",
});

const steps = [
  {
    title: "Tell us your due month",
    body: "One form, thirty seconds — just your name, email, and due date.",
  },
  {
    title: "We place you in your Season",
    body: "Everyone due the same month or two as you, all in Amsterdam.",
  },
  {
    title: "Say hello in the group",
    body: "A private WhatsApp thread — no ads, no strangers outside your Season.",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col items-center px-2 w-full max-w-full">
      {/* Hero */}
      <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          Free, for expecting families in Amsterdam
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Season Groups
        </h1>
        <p className="mt-4 mb-2 text-lg max-w-xl">
          You don't have to wait for your baby to arrive to start building your
          village. Join the other Amsterdam families due around the same time as
          you — before anyone's even born.
        </p>
      </div>

      <div className="mt-6 mb-8">
        <ShowcaseButton
          href="#join"
          title="Join your Season Group"
          fill={true}
          umamiName="Season Groups: Join"
        />
      </div>

      {/* How it works */}
      <section className="py-8 max-w-4xl mx-auto w-full">
        <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-center"
            >
              <div className="mx-auto mb-4 flex items-center justify-center w-9 h-9 rounded-full bg-brand-soft-green text-white font-bold">
                {index + 1}
              </div>
              <h3 className="font-bold text-brand-charcoal dark:text-brand-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="py-8 max-w-2xl mx-auto w-full text-center">
        <h2 className="text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-6">
          Why join before your baby's here
        </h2>
        <p className="text-lg leading-relaxed text-brand-charcoal/90 dark:text-brand-white/85">
          The parent down the street due the same month as you is asking the
          same questions you are — about midwives, kraamzorg, and what to
          actually pack in the hospital bag. Your Season Group is a place to
          find them now, so you're not starting from zero the week your baby
          arrives.
        </p>
      </section>

      {/* Join */}
      <section id="join" className="scroll-m-32 py-10 w-full">
        <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-8">
          Join your Season Group
        </h2>
        <SeasonGroupSignupForm />
      </section>
    </div>
  );
}
