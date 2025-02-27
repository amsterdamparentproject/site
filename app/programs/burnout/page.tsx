import SubscribeForm from "@/components/SubscribeForm";
import { genPageMetadata } from "app/seo";
import Image from "@/components/Image";
import { Authors, allAuthors } from "contentlayer/generated";
import Link from "@/components/Link";

export const metadata = genPageMetadata({ title: "Burnout Support Program" });

export default function Page() {
  const author = allAuthors.find(
    (p) => p.slug === "irenaDomachowska",
  ) as Authors;

  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <h1 className="text-center text-4xl leading-8 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-brand-white mb-8">
          Burnout Support Program
        </h1>
        <p className="mb-2 text-sm">Designed by:</p>
        <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0 mb-8">
          <li className="flex space-x-2" key={author.name}>
            {author.avatar && (
              <Image
                src={author.avatar}
                width={38}
                height={38}
                alt="avatar"
                className="h-18 w-18 rounded-full"
              />
            )}
            <div className="flex flex-col ml-2">
              <dl className="text-sm leading-5 font-medium" />
              <dt className="sr-only">Name</dt>
              <dd className="dark:text-brand-white">{author.name}</dd>
              <dt className="sr-only">Title</dt>
              <dd className="text-brand-soft-charcoal dark:text-brand-white">
                {author.occupation}
              </dd>
              <dt className="sr-only">Website</dt>
              <dd>
                {author.website && (
                  <Link
                    href={author.website}
                    className="text-program-burnout-blue hover:text-brand-goldenrod"
                  >
                    {"Website"}
                  </Link>
                )}
              </dd>
            </div>
          </li>
        </ul>
        <p className="mb-8">
          Did you know that{" "}
          <a
            className="text-program-burnout-blue hover:text-brand-goldenrod"
            href="https://www.jpedhc.org/article/S0891-5245(24)00188-3/fulltext"
          >
            {" "}
            65% of working parents report burnout symptoms
          </a>
          ? While there is broad awareness of postpartum mental health
          conditions like depression and anxiety, there is less conversation and
          healing around parental burnout, despite its prevalence. That's why
          APP has created a specialized support program to{" "}
          <b>
            help parents navigate parental burnout at work and home, with the
            help of peers and professionals
          </b>
          .
        </p>
        <SubscribeForm
          tag="burnout-support"
          ctaLabel="Sign up to be notified of launch:"
          subscribedLabel="Thanks for joining us!"
          color="program-burnout-blue"
        />

        <h2 className="mt-8 font-medium">The 2 month program includes:</h2>
        <ul className="list-disc mx-4">
          <li>
            A <b>small, safe cohort</b> of fellow parents going through the same
            thing
          </li>
          <li>
            Relevant <b>discussion topics and exercises</b> every 1-2 weeks
          </li>
          <li>
            <b>1:1 match</b> with a parent peer for private support
          </li>
          <li>
            <b>Cohort meetups</b>, online and in-person (with childcare!)
          </li>
        </ul>
        <p className="italic max-w-lg mt-4 mb-8">
          Facilitated by psychotherapist Dr. Irena (Miriam) Domachowska, APP
          co-founder and expert in parental burnout.
        </p>
        <Image
          alt="Burnout Support Flyer"
          src="/static/images/programs/burnout-support-flyer.png"
          className=""
          width={544}
          height={306}
        />
      </div>
    </div>
  );
}
