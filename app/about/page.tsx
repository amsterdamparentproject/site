import { genPageMetadata } from "app/seo";
import Link from "next/link";

export const metadata = genPageMetadata({ title: "About" });

export default function Page() {
  return (
    <div className="space-y-8 pb-12">
      {/* Main Header */}
      <div className="flex flex-col items-center space-y-2 py-6 md:space-y-5">
        <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
          About us
        </h1>
      </div>

      <p className="text-lg leading-7 text-gray-600 dark:text-gray-300">
        The Amsterdam Parent Project (APP) is a nonprofit organization providing
        peer and professional support to parents of young children in Amsterdam.
        We run a newsletter, events, and programs to connect the local community
        with the help they need to thrive in early parenthood.
      </p>

      {/* Team */}
      <div className="mt-4 mb-12 text-center">
        <Link
          href="/team"
          className="group inline-flex items-center text-3xl font-bold text-brand-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod transition-colors"
          prefetch={false}
        >
          Our team
          <span className="ml-2 transform group-hover:translate-x-2 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>

      {/* Mission */}
      <div
        id="mission-highlight"
        className="bg-brand-soft-green text-center px-8 py-10 rounded-2xl shadow-sm"
      >
        <h2 className="text-brand-goldenrod font-bold text-2xl pb-4 uppercase tracking-widest">
          Our mission
        </h2>
        <p className="text-brand-white text-xl leading-8 max-w-2xl mx-auto">
          Empower new parents in Amsterdam with peer and professional support,
          so that they thrive in the early years of parenthood.
        </p>
      </div>

      {/* Approach */}
      <section>
        <h2 className="text-brand-charcoal dark:text-brand-white font-bold text-3xl pt-8 pb-4 text-center">
          Our approach
        </h2>
        <p className="leading-7">
          We believe parents need context and community to thrive. Our
          "sandwich" model of support combines peer-to-peer connection
          (bottom-up) with expert advice (top-down) to help new parents navigate
          life with a baby/toddler with confidence and joy.
        </p>
      </section>

      {/* Values Grid */}
      <section>
        <h2 className="text-brand-charcoal dark:text-brand-white font-bold text-3xl pt-8 pb-8 text-center">
          Our values
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 justify-items-center">
          {[
            {
              emoji: "🫶🏻",
              title: "Collaborative",
              text: "We partner with peers, experts, and other communities. We're truly stronger together.",
            },
            {
              emoji: "🪟",
              title: "Transparent",
              text: "We build in the open with our public roadmap and published revenue numbers.",
            },
            {
              emoji: "📍",
              title: "Accessible",
              text: "We strive to keep costs low so all families can access support. In-person first.",
            },
            {
              emoji: "🌱",
              title: "Grounded",
              text: "We design with empathy and evidence, following modern support group guidelines.",
            },
          ].map((value) => (
            <li key={value.title} className="max-w-xs text-center">
              <p className="text-5xl mb-4">{value.emoji}</p>
              <h3 className="font-bold text-xl pb-2">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{value.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
