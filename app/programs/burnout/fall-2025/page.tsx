import { genPageMetadata } from "app/seo";
import Image from "@/components/Image";
import { Authors, allAuthors } from "contentlayer/generated";
import Link from "@/components/Link";
import ShowcaseButton from "@/components/ShowcaseButton";

export const metadata = genPageMetadata({ title: "Burnout Support Program" });

export default function Page() {
  const miriam = allAuthors.find(
    (p) => p.slug === "irenaDomachowska",
  ) as Authors;
  const alex = allAuthors.find((p) => p.slug === "default") as Authors;

  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <h1 className="text-center text-4xl leading-8 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-brand-white mb-8">
          Burnout Support Program:
          <br />
          Fall 2025 cohort
        </h1>
        <p className="mb-2 text-sm">Facilitated by:</p>
        <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0 mb-8">
          <li className="flex space-x-2" key={miriam.name}>
            {miriam.avatar && (
              <Image
                src={miriam.avatar}
                width={38}
                height={38}
                alt="avatar"
                className="h-18 w-18 rounded-full"
              />
            )}
            <div className="flex flex-col ml-2">
              <dl className="text-sm leading-5 font-medium" />
              <dt className="sr-only">Name</dt>
              <dd className="dark:text-brand-white">{miriam.name}</dd>
              <dt className="sr-only">Title</dt>
              <dd className="text-brand-soft-charcoal dark:text-brand-white">
                {miriam.occupation}
              </dd>
              <dt className="sr-only">Website</dt>
              <dd>
                {miriam.website && (
                  <Link
                    href={miriam.website}
                    className="text-program-burnout-blue hover:text-brand-goldenrod"
                  >
                    {"Website"}
                  </Link>
                )}
              </dd>
            </div>
          </li>
          <li className="flex space-x-2" key={alex.name}>
            {alex.avatar && (
              <Image
                src={alex.avatar}
                width={38}
                height={38}
                alt="avatar"
                className="h-18 w-18 rounded-full"
              />
            )}
            <div className="flex flex-col ml-2">
              <dl className="text-sm leading-5 font-medium" />
              <dt className="sr-only">Name</dt>
              <dd className="dark:text-brand-white">{alex.name}</dd>
              <dt className="sr-only">Title</dt>
              <dd className="text-brand-soft-charcoal dark:text-brand-white">
                {alex.occupation}
              </dd>
              <dt className="sr-only">Website</dt>
              <dd>
                {alex.website && (
                  <Link
                    href={alex.website}
                    className="text-program-burnout-blue hover:text-brand-goldenrod"
                  >
                    {"Website"}
                  </Link>
                )}
              </dd>
            </div>
          </li>
        </ul>
        <p className="mt-4 mb-4">
          <b>
            Welcome to the Fall 2025 cohort of APP's Burnout Support
            Program!{" "}
          </b>
          We're very grateful that you're joining us and that we're on this
          learning and healing journey together.
        </p>
        <p>
          First and foremost: This program is designed to meet you where you
          are. It consists of{" "}
          <b>
            professionally guided peer support: 3 cohort meetups and 5
            discussion topics
          </b>{" "}
          sent via email to 1:1 pairs.
        </p>
        <p>
          Everything is spaced out to provide ample time to connect and process;
          the last thing we want to do is put too much onto your overflowing
          plate. Here are some baseline expectations as a participant:
        </p>
        <ul className="list-disc mx-4 max-w-xl">
          <li>
            All <b>cohort meetups are optional</b> (but we do hope you attend!)
          </li>
          <li>
            We don't expect pairs to be constantly available for one another.
          </li>
          <li>
            We do expect <b>pairs to touch base at least 5 times</b> over the 8
            week program: once per discussion topic.
          </li>
        </ul>
        <p className="italic max-w-xl">
          If you're feeling overwhelmed, or if the support isn't helping you —
          please, please, please let us know at{" "}
          <a href="mailto:amsterdamparentproject@gmail.com">
            amsterdamparentproject@gmail.com
          </a>
          .
        </p>
        <h2 className="mt-8 font-medium">Program schedule:</h2>
        <ul className="list-disc mx-4">
          <li>
            <b>1 Sept</b>: Program kickoff
          </li>
          <li>
            <b>By 5 Sept</b>: 1:1 introductions
          </li>
          <li>
            <b>7 Sept</b>: Discussion topic #1
          </li>
          <li>
            <b>To be scheduled between 7-14 Sept</b>: Cohort meetup #1 (online)
          </li>
          <li>
            <b>14 Sept</b>: Discussion topic #2
          </li>
          <li>
            <b>To be scheduled between 14-28 Sept</b>: Cohort meetup #2 (in
            person)
          </li>
          <li>
            <b>28 Sept</b>: Discussion topic #3
          </li>
          <li>
            <b>5 Oct</b>: Discussion topic #4
          </li>
          <li>
            <b>12 Oct</b>: Discussion topic #5
          </li>
          <li>
            <b>To be scheduled between 12-26 Oct</b>: Cohort meetup #3 (online)
          </li>
          <li>
            <b>31 Oct</b>: Program end
          </li>
        </ul>
        <p>We'll send Google Calendar invites to help you stay up to date.</p>
        <p className="italic max-w-lg mb-12">
          Note: The program currently has no scheduled activities during
          upcoming Herfstvakantie.
        </p>
        <ShowcaseButton
          href="/guides/navigating-stress-and-burnout.png"
          title="Guide: Navigating Stress and Burnout"
          newTab={true}
        />
        <h2 className="mt-8 font-medium">What's my 1:1 match?</h2>
        <p>
          If you've indicated on the signup form that you want a match, you will
          be matched with another person in the cohort for private peer support.
          They're <b>your buddy in the program</b>: you'll receive the
          discussion topics and online resources to talk about with them. You
          both have so much to learn from one another, especially with expert
          guidance.
        </p>
        <p>
          You are matched based on factors like: your stage of burnout, your
          location in Amsterdam, how many kids you have, and how old they are.
        </p>
        <p className="italic max-w-xl">
          If your match isn't a good fit, please email us at{" "}
          <a href="mailto:amsterdamparentproject@gmail.com">
            amsterdamparentproject@gmail.com
          </a>
          .
        </p>
        <h2 className="mt-8 font-medium">What are discussion topics?</h2>
        <p>
          There are 5 discussion topics sent to each of the cohort pairs{" "}
          <b>via email</b> over the course of the program. These are designed to{" "}
          <b>help you connect with your match</b> for peer support. They
          facilitate guided conversation on an area of burnout.
        </p>
        <p>
          In addition to the discussion prompt, you'll also get a related
          resource on an aspect of burnout. It's optional reading, but it may
          also serve as a great topic to discuss with your match.
        </p>
        <h2 className="mt-8 font-medium">What are cohort meetups?</h2>
        <p>
          There are 3 cohort meetups scheduled during the 8 week program: 2
          online and 1 in person in Amsterdam. It's a chance for all of us come
          together to learn about and hear{" "}
          <b>different perspectives on overarching burnout topics</b>, like
          juggling your career while burnt out; developing burnout-busting daily
          routines; managing relationships, and more.
        </p>
        <p className="mb-8">
          Each of the meetups will be led by one of the facilitators: the online
          meetups by Miriam (our psychotherapist) and the in-person meetup by
          Alex (who has personal experience with burnout). The location of the
          in-person meetup is TBD, but will be in Amsterdam.
        </p>
        <h2 className="mt-8 font-medium">Still have questions?</h2>
        <p>
          Email us at{" "}
          <a href="mailto:amsterdamparentproject@gmail.com">
            amsterdamparentproject@gmail.com
          </a>
        </p>
        <Image
          alt="Burnout Support Flyer"
          src="/static/images/programs/burnout/fall-2025.png"
          className=""
          width={544}
          height={306}
        />
      </div>
    </div>
  );
}
