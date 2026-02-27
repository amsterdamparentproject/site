import { genPageMetadata } from "app/seo";
import Image from "@/components/Image";
import { Authors, allAuthors } from "contentlayer/generated";
import Link from "@/components/Link";
import cohortSchedules from "@/data/fourthTrimesterProgram/schedules";
import FTPCohortScheduleTable from "@/components/FTPCohortScheduleTable";
import ShowcaseButton from "@/components/ShowcaseButton";

export const metadata = genPageMetadata({
  title: "Fourth Trimester Program: March-May 2026",
});

export default function Page() {
  const miriam = allAuthors.find(
    (p) => p.slug === "irenaDomachowska",
  ) as Authors;
  const danielle = allAuthors.find(
    (p) => p.slug === "danielleBensky",
  ) as Authors;
  const alex = allAuthors.find((p) => p.slug === "default") as Authors;

  const facilitators = (
    <div>
      <h2 className="mt-6 mb-6 font-medium text-center">Facilitators:</h2>
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
        <li className="flex space-x-2" key={danielle.name}>
          {danielle.avatar && (
            <Image
              src={danielle.avatar}
              width={38}
              height={38}
              alt="avatar"
              className="h-18 w-18 rounded-full"
            />
          )}
          <div className="flex flex-col ml-2">
            <dl className="text-sm leading-5 font-medium" />
            <dt className="sr-only">Name</dt>
            <dd className="dark:text-brand-white">{danielle.name}</dd>
            <dt className="sr-only">Title</dt>
            <dd className="text-brand-soft-charcoal dark:text-brand-white">
              {danielle.occupation}
            </dd>
            <dt className="sr-only">Website</dt>
            <dd>
              {danielle.website && (
                <Link
                  href={danielle.website}
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
    </div>
  );

  const cohortDetails = cohortSchedules.find((c) => c.slug === "mar-2026");

  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <h1 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-5xl md:leading-10 dark:text-brand-white mb-8">
          Fourth Trimester Program:
          <br />
          March-May 2026 cohort
        </h1>
        <p className="mt-4 mb-4">
          <b>
            Welcome to the March 2026 cohort of APP's Fourth Trimester
            Program!{" "}
          </b>
          We're very grateful that you're joining us in such a transformative
          period of newborn parenthood. We're here for the soft, supportive
          transition into one of the more challenging seasons of life.
        </p>
        <p>
          The Fourth Trimester Program is a 3 month support group designed to
          meet your whole (expanding!) family, where y'all are at as newborn
          parents. The goal is to create a{" "}
          <b>safe space that's your "first line" of care</b> — the expert
          advice, peer perspectives, and network you need to navigate this
          period with confidence and calm.
        </p>

        {facilitators}

        <p>As part of the support system, you have access to:</p>
        <ul className="list-disc mx-5 mb-8">
          <li>
            Online discussions with a postpartum professional (👋🏻 Danielle)
          </li>
          <li>
            Regular socials to do fun stuff, together & with the babies (👋🏻
            Alex)
          </li>
          <li>
            A private WhatsApp group moderated by a psychotherapist — and
            newborn mom! (👋🏻 Miriam)
          </li>
          <li>Newborn parenting resource guides for learning & reference</li>
        </ul>

        <ShowcaseButton
          key="resource-guides"
          href="/guides"
          title="Go to the resource guides"
          fill={true}
        />

        <p className="mt-6">
          A reminder: We are here to reduce overwhelm, not contribute to it! If
          you need to show up late to a cohort meeting or skip altogether, truly
          no worries. That's why we offer online resources such as the program
          guides and the moderated WhatsApp group. We'll have regular async
          check-ins in addition to our scheduled meetups.
        </p>

        <h2 className="mt-8 font-medium">Cohort schedule:</h2>

        {cohortDetails && <FTPCohortScheduleTable cohort={cohortDetails} />}

        <p>We'll send Google Calendar invites to help you stay up to date.</p>
        <p className="italic max-w-lg mb-12">
          Note: The program has no scheduled activities during public holidays.
          But you're welcome to organize adhoc gatherings via the WhatsApp
          group!
        </p>

        <h2 className="mt-8 font-medium">What are topic discussions?</h2>
        <p>
          Every few weeks we gather to discuss a newborn parenting topic at a
          time that's developmentally appropriate for your baby and you as
          parents. These topics were selected (from many!) based on local
          postpartum experts' perspectives on what they help parents with the
          most in the first few months of caring for a newborn.
        </p>
        <p>
          Each discussion is facilitated by a postpartum professional. The goal
          is not to <i>teach</i>, but rather to hold space and guide the group
          towards safe and productive conversation. The sessions are centered
          around helping cohort members process experiences, infused with
          evidence and expert perspectives.
        </p>
        <p>
          A week before the topic discussion, you'll receive an email with the
          resource guide. The guide has been compiled and reviewed by postpartum
          experts, and include evidence-based information, exercises, and a
          shortlist of local resources (online & offline) to learn more.{" "}
          <b>
            It is not necessary to read the guides before showing up to the
            discussion
          </b>
          . They are meant to validate experiences, inspire discussion, and be a
          personal reference for your family!
        </p>
        <p>
          We will also send along an open Q&A form for you to submit questions
          to the topic discussion facilitator ahead of time. You have the
          ability to ask questions anonymously via the form, or you can post
          them in the WhatsApp group.
        </p>
        <p>
          <i>
            If there's a topic we're not covering that you'd like to discuss as
            a group, let us know! Email us at{" "}
            <a href="mailto:hello@amsterdamparentproject.nl">
              hello@amsterdamparentproject.nl
            </a>
            .
          </i>
        </p>
        <h2 className="mt-8 font-medium">What are socials?</h2>
        <p>
          Socials are a chance to meet other newborn parents in a totally casual
          way! We have a variety of fun activities planned that are enriching
          for both parents and babies.
        </p>
        <p>
          If you are having a tough morning and can't make it to the social in
          time — or at all — it's totally fine! Newborn life is unpredictable.
          You're welcome to schedule adhoc meetups (coffees, walks, online
          chats, etc) yourself through the WhatsApp group.
        </p>
        <p className="mb-8">
          Each social is facilitated by a local parent who is a few months (or
          years!) ahead of you in the parenting journey.
        </p>
        <h2 className="mt-8 font-medium">Where can I find the resources?</h2>
        <p>
          You can download them{" "}
          <a href="/guides" target="_blank">
            here
          </a>
          .
        </p>
        <h2 className="mt-8 font-medium">A reminder about our values</h2>
        <p>
          We welcome families of all shapes and sizes and believe that our
          community is at its best when diverse perspectives are celebrated. To
          keep this a safe and supportive space for everyone, we kindly ask that
          all members uphold these values. We reserve the right to remove anyone
          who isn't aligned with this spirit of mutual respect. Thanks for
          helping us build a truly inclusive village! 🫶🏻
        </p>
        <h2 className="mt-8 font-medium">
          Still have questions or want to leave feedback?
        </h2>
        <p>
          Email us at{" "}
          <a href="mailto:hello@amsterdamparentproject.nl">
            hello@amsterdamparentproject.nl
          </a>
        </p>
      </div>
    </div>
  );
}
