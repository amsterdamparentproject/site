import { Authors, allAuthors } from "contentlayer/generated";
import { MDXLayoutRenderer } from "pliny/mdx-components";
import AuthorLayout from "@/layouts/AuthorLayout";
import { coreContent } from "pliny/utils/contentlayer";
import { genPageMetadata } from "app/seo";
import Link from "next/link";

export const metadata = genPageMetadata({ title: "About" });

export default function Page() {
  const author = allAuthors.find((p) => p.slug === "default") as Authors;
  const mainContent = coreContent(author);

  return (
    <div>
      <div className="flex flex-col items-center space-y-2 py-6 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-brand-white">
          About us
        </h1>
      </div>
      <p>
        The Amsterdam Parent Project (APP) is a nonprofit organization providing
        peer and professional support to parents of young children in Amsterdam.
        We run a newsletter, events, and programs to connect the local community
        with the help they need to thrive in early parenthood.
      </p>
      <div
        id="mission-highlight"
        className="bg-brand-soft-green text-center px-8 py-8 mt-8 rounded-md"
      >
        <h1 className="text-brand-goldenrod font-bold text-2xl pb-4">
          Our mission
        </h1>
        <p className="text-brand-white">
          Empower new parents in Amsterdam with peer and professional support,
          so that they thrive in the early years of parenthood.
        </p>
      </div>

      <h1 className="text-brand-charcoal dark:text-brand-white font-bold text-2xl pt-8 pb-4 text-center">
        Our approach
      </h1>
      <p>
        We believe parents need context and community to thrive. Our "sandwich"
        model of support combines peer-to-peer connection (bottom-up) with
        expert advice (top-down) to help new parents navigate life with a
        baby/toddler with confidence and joy. By delivering relevant information
        at the right time in live settings, we avoid overwhelming parents and
        provide actionable advice when they need it most.
      </p>

      <h1 className="text-brand-charcoal dark:text-brand-white font-bold text-2xl pt-8 pb-4 text-center">
        Our values
      </h1>
      <ul className="flex flex-wrap justify-center">
        <li className="w-80 px-4 pl-0 pb-8 text-center">
          <p className="text-4xl">🫶🏻</p>
          <p className="font-bold pb-2">Collaborative</p>
          <p className="text-left">
            We partner with peers, experts, and other communities. If we see a
            gap in support, we first ask: "Is there anyone else doing this?"
            We're truly stronger together.
          </p>
        </li>
        <li className="w-80 px-4 pl-0 pb-8 text-center">
          <p className="text-4xl">🪟</p>
          <p className="font-bold pb-2">Transparent</p>
          <p className="text-left">
            We build in the open with our public roadmap and published revenue
            numbers. You'll always know precisely what we're working on and
            where your money is going.
          </p>
        </li>
        <li className="w-80 px-4 pl-0 pb-8 text-center">
          <p className="text-4xl">📍</p>
          <p className="font-bold pb-2">Local</p>
          <p className="text-left">
            We serve Amsterdam first, and prioritize in-person interactions. Our
            goal is to help you find the support next door!
          </p>
        </li>
        <li className="w-80 px-4 pl-0 pb-8 text-center">
          <p className="text-4xl">🌱</p>
          <p className="font-bold pb-2">Grounded</p>
          <p className="text-left">
            We design our services with empathy and evidence. All of experts
            follow the best practices in their fields, and we ensure that our
            peer-led spaces follow support group guidelines.
          </p>
        </li>
      </ul>

      <Link
        href="/team"
        className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
        aria-label="Learn more about our team"
      >
        <h1 className="text-brand-charcoal dark:text-brand-white font-bold text-2xl pt-8 pb-4 text-center">
          Our team &rarr;
        </h1>
      </Link>
    </div>
  );
}
