import React from "react";
import Link from "@/components/Link";
import HighlightSection from "@/components/homepage/HighlightSection";
import siteMetadata from "@/data/siteMetadata";
import { CalendarEvent } from "@/lib/calendar";
import {
  LayoutGrid,
  BookOpen,
  Flame,
  Calendar,
  Newspaper,
  Mailbox,
  CirclePile,
  HeartHandshake,
} from "lucide-react";
import { ResourceRow } from "@/components/homepage/ResourceRow";
import { EventRow } from "@/components/homepage/EventRow";

type EventWithDate = CalendarEvent & { dateObj: Date };

const createEventList = (events: CalendarEvent[], MAX_DISPLAY = 3) => {
  const today = new Date();
  const comingUp = events
    .map(
      (event): EventWithDate => ({ ...event, dateObj: new Date(event.date) }),
    )
    .filter((event) => event.dateObj >= today)
    .sort(
      (a: EventWithDate, b: EventWithDate) =>
        a.dateObj.getTime() - b.dateObj.getTime(),
    );
  if (comingUp.length < MAX_DISPLAY) {
    const comingSoon = events.filter((event) => event.comingSoon);
    const needed = MAX_DISPLAY - comingUp.length;
    return (comingUp as CalendarEvent[]).concat(comingSoon.slice(0, needed));
  }
  return comingUp.slice(0, MAX_DISPLAY);
};

export default function Home({
  posts,
  events,
}: {
  posts: { slug: string; title: string; date: string }[];
  events: CalendarEvent[];
}) {
  const upcomingEvents = createEventList(events);

  const isSpotlight = (post: { slug: string }) =>
    post.slug.startsWith("expert-spotlight/") ||
    post.slug.startsWith("community-spotlight/");
  const latestSpotlight = posts.find(isSpotlight);
  const latestAdvicePost = posts.find((p) => !isSpotlight(p));

  return (
    <div className="px-4 sm:px-0 py-6 space-y-10">
      {/* Mobile-only brand title + tagline */}
      <div className="sm:hidden text-center space-y-2">
        <div className="text-2xl font-semibold text-brand-soft-green dark:text-brand-goldenrod">
          {siteMetadata.headerTitle}
        </div>
        <p className="text-base text-brand-charcoal dark:text-brand-white">
          A{" "}
          <Link
            href="/about"
            className="text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet"
          >
            nonprofit community organization
          </Link>{" "}
          helping parents with babies and toddlers thrive in Amsterdam
        </p>
      </div>

      {/* Hero heading */}
      <section className="text-center space-y-3 max-w-3xl mx-auto mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold text-brand-charcoal dark:text-brand-white leading-tight">
          Join over 1,000 Amsterdam parents and experts showing up for each
          other
        </h1>
        <p className="hidden sm:block text-lg font-semibold text-brand-charcoal dark:text-brand-white">
          Amsterdam Parent Project (APP) is a{" "}
          <Link
            href="/about"
            className="text-brand-soft-green dark:text-brand-violet hover:text-brand-goldenrod"
          >
            nonprofit community organization
          </Link>{" "}
          helping parents with babies and toddlers thrive in Amsterdam
        </p>
      </section>

      <HighlightSection />

      {/* Next events + Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Next events */}
        <div>
          <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-6">
            Next events
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <EventRow
                key={event.title + event.date}
                event={event}
                locale={siteMetadata.locale}
              />
            ))}
          </div>
          <hr className="border-brand-sand/20 mt-6 mb-4" />
          <ResourceRow
            icon={<Calendar className="w-5 h-5" />}
            href="/calendar"
            title="Community Calendar"
            subtitle="A curated list of local events for babies, toddlers, and their parents"
            umamiEvent="Home: Calendar"
            subLinks={[
              {
                href: "/calendar/submit-event",
                label: "Add your own event",
                umamiEvent: "Home: Submit event (Resources)",
              },
            ]}
          />
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-6">
            Resources
          </h2>
          <div className="space-y-6">
            <ResourceRow
              icon={<HeartHandshake className="w-5 h-5" />}
              href="/programs/fourth-trimester"
              title="Fourth Trimester Program"
              subtitle="Your neighborhood support system in the first months postpartum"
              umamiEvent="Home: Fourth Trimester Program"
            />
            <ResourceRow
              icon={<Mailbox className="w-5 h-5" />}
              href="https://postpartumpost.com"
              title="Postpartum Post"
              subtitle="Monthly friendship starter packs for new and expecting parents: meet someone new and get a curated list of things to do together"
              umamiEvent="Home: Postpartum Post"
            />
            <ResourceRow
              icon={<Newspaper className="w-5 h-5" />}
              href="/newsletter"
              title="Newsletter: Just a Phase"
              subtitle="Local events & expert advice sent every other Monday"
              umamiEvent="Home: Newsletter (Resources)"
              subLinks={[
                {
                  href: "/newsletter",
                  label: "Read past issues",
                  umamiEvent: "Home: Newsletter (Resources)",
                },
              ]}
            />
            <ResourceRow
              icon={<BookOpen className="w-5 h-5" />}
              href="/advice"
              title="Dear Dr. Mom: You ask, a local expert answers"
              umamiEvent="Home: Dear Dr. Mom"
              subtitle="Postpartum advice and community spotlights"
              subLinks={[
                ...(latestAdvicePost
                  ? [
                      {
                        href: `/advice/${latestAdvicePost.slug}`,
                        label: latestAdvicePost.title,
                        umamiEvent: "Home: Latest Advice Post",
                      },
                    ]
                  : []),
                ...(latestSpotlight
                  ? [
                      {
                        href: `/advice/${latestSpotlight.slug}`,
                        label: latestSpotlight.title,
                        umamiEvent: "Home: Latest Spotlight",
                      },
                    ]
                  : []),
              ]}
            />
            <ResourceRow
              icon={<Flame className="w-5 h-5" />}
              href="/programs/burnout"
              title="Burnout Support Program"
              subtitle="Tackle parental burnout, together"
              umamiEvent="Home: Burnout Support Program"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
