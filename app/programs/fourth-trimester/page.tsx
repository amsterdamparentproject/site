import eventsData from "@/data/fourthTrimesterProgram";
import Card from "@/components/programSessionCard";
import { genPageMetadata } from "app/seo";
import { Authors, allAuthors } from "contentlayer/generated";
import Image from "@/components/Image";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { coreContent } from "pliny/utils/contentlayer";
import ShowcaseButton from "@/components/ShowcaseButton";

export const metadata = genPageMetadata({ title: "Fourth Trimester Program" });

const sortEvents = (events) => {
  return events.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    }
    if (a.date > b.date) {
      return 1;
    }
    return 0;
  });
};

const getSessions = (sessions) => {
  const today = new Date();

  const comingUpSessions = sessions.filter(
    (sessions) => sessions.date >= today,
  );
  const comingSoonSessions = sessions.filter((sessions) => sessions.comingSoon);
  const currentPrograms = sessions.filter(
    (sessions) => sessions.until >= today,
  );

  return {
    current: sortEvents(
      currentPrograms.concat(comingUpSessions).concat(comingSoonSessions),
    ),
  };
};

const allEvents = getSessions(eventsData);

const upcomingSessions = () => {
  return (
    <div className="-m-4 flex flex-wrap">
      {allEvents.current.map((d) => (
        <Card
          key={d.title}
          title={d.title}
          description={d.description}
          date={d.date}
          until={d.until}
          imgSrc={d.imgSrc ? d.imgSrc : "/static/images/web-share.png"}
          href={d.href}
          comingSoon={d.comingSoon}
          hostName={d.hostName}
          components={d.components}
        />
      ))}
    </div>
  );
};

export default function programDetails() {
  const authorDetails = ["heatherBerry", "irenaDomachowska", "alexSiega"].map(
    (author) => {
      const authorResults = allAuthors.find((p) => p.slug === author);
      return coreContent(authorResults as Authors);
    },
  );

  return (
    <div className="flex-column justify-center mx-2">
      <div
        className="pt-6 pb-6 flex flex-col items-center"
        id="program-description"
      >
        <h1 className="text-brand-charcoal dark:text-brand-white text-center text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
          Fourth Trimester Program
        </h1>
        <h2 className="text-brand-soft-charcoal dark:text-brand-white text-center text-lg font-medium tracking-tight mb-2 mt-4">
          Your local, English-speaking support system in the first months
          postpartum. Right when you need it, right where you are, with experts
          and fellow newborn parents right there with you.
        </h2>

        <div className="mt-2 mb-6">
          <SubscribeForm
            tag="website-fourth-trimester-program"
            ctaLabel="Be notified when we launch:"
          />
        </div>

        <p className="mb-6">
          <b>
            Finding the right support after you have a baby is a daunting
            task.{" "}
          </b>
          Your giant parent group is dispensing baby advice 100 times a day,
          you're frantically Googling "Why is this happening..." during 2am
          feeds, and social media is constantly telling you what you should be
          feeling as a new parent. If you want an actual expert's opinion, you
          may be paying €100/hour for a consult — and you have to spend time and
          energy to find them in the first place. Speaking from experience: It
          can be overwhelming and exhausting.
        </p>
        <p className="mb-6">
          <b>
            APP's Fourth Trimester Program is designed to cut through the noise
          </b>{" "}
          to what really matters postpartum: creating a healthy and happy
          environment for all members of your new family. We bring{" "}
          <b>
            guidance from Amsterdam's premier postpartum professionals{" "}
            <i>together with</i> parent mentors and peers
          </b>
          . Whereas other resources may be purely informational, and others
          purely anecdotal, the Fourth Trimester Program blends both — because
          <b>
            {" "}
            parenting "best practices" come from both science and community 🤝
          </b>
        </p>
        <p>
          APP is a non-profit organization, built by and for the community. By
          sharing access to expertise, we make postpartum support through the
          Fourth Trimester Program <b>accessible and afforable</b> for all
          families.
        </p>

        <div className="mt-6">
          <ShowcaseButton
            href="#upcoming-sessions"
            title="Join an upcoming session"
            fill={true}
          />
        </div>

        <div>
          <h2 className="mt-6 font-medium mb-2 text-center">What you get:</h2>
          <ul className="list-disc max-w-lg">
            <li className="mx-4">
              <b>Expert workshops + "ask me anything" sessions</b> on topics
              that track with your baby's growth — and yours, as a new parent
            </li>
            <li className="mx-4">
              Tailored <b>resources that guide you</b> through your baby's
              development, crafted by local postpartum professionals
            </li>
            <li className="mx-4">
              A new (manageable!) <b>network of fellow newborn parents</b>{" "}
              around your baby's age
            </li>
          </ul>
        </div>
        <div className="space-y-2 md:space-y-5">
          <h2 className="mt-6 font-medium text-center">Designed by:</h2>
          <ul className="flex flex-wrap justify-center gap-4 sm:space-x-4 xl:space-y-4 xl:space-x-0 mb-6">
            {authorDetails.map((author) => (
              <li className="flex space-x-3 w-55" key={author.name}>
                {author.avatar && (
                  <Image
                    src={author.avatar}
                    width={38}
                    height={38}
                    alt="avatar"
                    className="h-18 w-18 rounded-full"
                  />
                )}
                <dl className="text-sm leading-5 font-medium">
                  <dt className="sr-only">Name</dt>
                  <dd className="dark:text-brand-white">
                    {author.website && (
                      <Link
                        href={author.website}
                        className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green"
                      >
                        {author.name}
                      </Link>
                    )}
                  </dd>
                  <dt className="sr-only">Title</dt>
                  <dd className="text-brand-soft-charcoal dark:text-brand-white">
                    {author.occupation}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        </div>
        <p className="italic max-w-lg text-sm">
          We're also deeply supported by the Amsterdam postpartum expert
          community. Our partnerships with midwives, kraamzorgs,
          psychotherapists, sleep and lactation consultants, and more help keep
          our content up to date and also ground us here in the community — so
          that the people we serve have a true foundation of postpartum support.
        </p>

        <div className="mt-6">
          <ShowcaseButton href="#faq" title="Learn more" fill={true} />
        </div>
      </div>

      <div className="container pt-4 pb-6 scroll-m-32" id="upcoming-sessions">
        <h2 className="text-3xl font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-4">
          Upcoming sessions
        </h2>
        <p className="italic text-sm mb-4">
          While we build the 12-week program, we're offering completed modules
          as standalone courses.
        </p>
        {upcomingSessions()}
      </div>

      <div id="faq" className="scroll-m-32">
        <h2 className="text-3xl font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod my-4">
          FAQ
        </h2>
        <ul className="list-disc mx-4">
          <li className="mb-4">
            <h3>
              <b>What's different about the Fourth Trimester Program?</b>
            </h3>
            <p className="mb-2 text-sm">
              Parents — especially expat parents — have complex support needs:
            </p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>
                <u>Right timing</u>: You have questions you never anticipated
                that need answering now, and you can't remember what you learned
                before the birth.
              </li>
              <li>
                <u>Right sources</u>: You need insights from accredited experts,
                not some random blog you found through Google/ChatGPT/WhatsApp.
              </li>
              <li>
                <u>Right people</u>: You're less likely to build a stable
                support system with folks in Oost if you live in West, or if
                their baby is 8 months older than yours.
              </li>
              <li>
                <u>Right language</u>: You're not familiar with the Dutch
                language/system, and you don't need the mental overhead to
                figure it out right now.
              </li>
              <li>
                <u>Right price</u>: Having a baby is expensive, and the last
                thing you need is to weigh affordability with getting the
                support you need.
              </li>
            </ul>
            <p className="my-2 text-sm">
              We haven't found a single program in the Netherlands that does all
              this. The Fourth Trimester Program is meant to be your guide, so
              that you don't have to think about how to build your own support.
              You just have to show up ☺️
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>Why are your sessions cheaper than others?</b>
            </h3>
            <p className="text-sm">
              APP operates as a non-profit. We strive to be a community resource
              above all. Sessions are offered at cost and are powered by
              volunteer work, to be as accessible and affordable as possible.
              You're paying for the expert's time and APP operating costs:
              that's it. Each session has the option to "pay the organizer," too
              — so we can not only sustain, but grow.
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>This sounds a lot like Mother's Groups in the UK...</b>
            </h3>
            <p className="text-sm">
              Yes, exactly! It's inspired by Canada's postpartum support system
              and <a href="https://www.peps.org/">PEPS</a> in Seattle. Our goal
              has never been to create a unique, revolutionary postpartum
              program; it's to import the successful models that exist in other
              countries to Amsterdam, to cover the gap in English-language
              postpartum support here.
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>Why is APP tackling this?</b>
            </h3>
            <p className="text-sm">
              It's something close to our hearts and first-hand experience.
              Having become parents in Amsterdam ourselves, we couldn't
              transition into new parenthood with confidence with the existing
              the English-language resources available. After asking ourselves
              "Why is this so hard?", we started asking, "What can we do about
              it?"
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>I'm a postpartum professional — how can I help?</b>
            </h3>
            <p className="mb-2 text-sm">
              Thanks for your enthusiasm! We'd love to be in touch. There are
              three main ways to help:
            </p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>
                <u>Help us build cohorts</u>: APP believes that the most
                successful cohorts will have something in common: same
                midwife/doula, same neighborhood, etc. If you serve pregnant
                people, we'd love to talk to you about how we can offer sessions
                or a full program to your clients giving birth around the same
                time.
              </li>
              <li>
                <u>Help us build content</u>: We regularly seek reviews from
                experts to ensure our content aligns with current research.
              </li>
              <li>
                <u>Help us deliver content</u>: Every session needs a host! If
                you're an expert in a session topic and want to host, please
                reach out.
              </li>
            </ul>
            <p className="my-2 text-sm">
              You can reach us at{" "}
              <a href="mailto:amsterdamparentproject@gmail.com">
                amsterdamparentproject@gmail.com
              </a>
              .
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
