"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import MonthlyJourneyGrid from "@/components/first-year-program/MonthlyJourneyGrid";
import CostsBreakdown from "@/components/first-year-program/CostsBreakdown";
import ProgramFAQ from "@/components/first-year-program/ProgramFAQ";
import ProgramJourney from "@/components/first-year-program/ProgramJourney";
import PhotoGallery from "@/components/first-year-program/PhotoGallery";
import PhotoLightbox, {
  PhotoLightboxImage,
} from "@/components/first-year-program/PhotoLightbox";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "@/components/Link";
import { MoveRight } from "lucide-react";
import FYPJoinForm from "@/components/first-year-program/FYPJoinForm";
import Image from "@/components/Image";

// ---------------------------------------------------------------------------
// Photo gallery data
// ---------------------------------------------------------------------------

const communityPhotos = [
  {
    src: "/static/images/programs/first-year-program/gallery/cafe-de-hallen.webp",
    alt: "Parents chatting and holding babies at a De Hallen café meetup",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/museum-group.webp",
    alt: "A group of parents and babies posing together at the Rijksmuseum",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/park-walk.webp",
    alt: "Parents walking together with a stroller along a tree-lined park path",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/cafe-table.webp",
    alt: "A group of parents gathered around a café table for a social meetup",
  },
];

const programMomentPhotos = [
  {
    src: "/static/images/programs/first-year-program/gallery/tummy-time-reading.webp",
    alt: "Two babies on their tummies reading a picture book together",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/playroom.webp",
    alt: "Parents and babies playing together in a soft playroom",
  },
];

const expertSessionPhoto = {
  src: "/static/images/programs/first-year-program/gallery/zoom-intro-call.webp",
  alt: "A live virtual expert discussion during the First Year Program",
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const highlights = [
  {
    icon: "🩺",
    feature: "Expert discussions",
    scenario: "For expert guidance without the research overwhelm",
  },
  {
    icon: "🤝",
    feature: "1:1 parent match",
    scenario: "For when you want a friend, not just a community",
  },
  {
    icon: "☕️",
    feature: "Group socials",
    scenario:
      "For discovering the baby-friendly side of Amsterdam alongside other families",
  },
  {
    icon: "💬",
    feature: "Moderated community",
    scenario:
      "For when you need reassurance from a small group of local parents, not AI",
  },
];

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  header: string;
  subtitle?: React.ReactNode;
}

const SectionHeader = ({ header, subtitle }: SectionHeaderProps) => {
  const headerMargin = subtitle ? "mb-4" : "mb-12";
  return (
    <>
      <h2
        className={`text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod ${headerMargin}`}
      >
        {header}
      </h2>
      {subtitle && (
        <div className="text-center text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 max-w-2xl mx-auto leading-relaxed italic mb-8 px-4">
          {subtitle}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// FTPBanner
// ---------------------------------------------------------------------------

function FTPBanner() {
  const params = useSearchParams();
  if (params.get("from") !== "fourth-trimester") return null;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-soft-green px-4 py-3 text-center text-sm text-white">
      The Fourth Trimester Program is now the{" "}
      <strong>First Year Program</strong>: Whole family support through
      pregnancy and your baby&apos;s first year.{" "}
      <a
        href="#ftp-comparison"
        className="font-semibold underline text-brand-goldenrod hover:text-brand-goldenrod/80"
      >
        Learn more
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DepositConfirmedBanner
// ---------------------------------------------------------------------------

function DepositConfirmedBanner() {
  const params = useSearchParams();
  const action = params.get("deposit");
  if (!action) return null;

  const message =
    action === "transfer_fyp"
      ? "Thanks for transferring your deposit to the First Year Program. We can't wait to welcome you in September! ❤️"
      : action === "refund"
        ? "We've received your request for a refund. It will be processed within 7 business days."
        : null;

  if (!message) return null;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-soft-green px-4 py-3 text-center text-sm text-white">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface FirstYearProgramClientProps {
  // Prefill for FYPJoinForm — resolved server-side by
  // app/programs/first-year/page.tsx from a ?legacyId= URL param (the
  // legacy-transition email's personalized "Register" link, see
  // lib/emails/fyp-legacy-transition.ts's buildJoinUrl) and passed down as
  // plain props.
  //
  // IMPORTANT: this component does NOT read these off useSearchParams()
  // itself, on purpose. An earlier version did exactly that — reading
  // firstName/lastName/email straight from the client-visible URL — which
  // Alex flagged as a real privacy problem (PII in browser history,
  // server/CDN logs, analytics tools, Referer headers). The URL only ever
  // carries the opaque legacyId now; see page.tsx's resolveLegacyPrefill
  // for where the actual lookup happens.
  initialFirstName?: string;
  initialLastName?: string;
  initialEmail?: string;
  initialMonth?: string;
  initialYear?: string;
}

export default function FirstYearProgramClient({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialMonth,
  initialYear,
}: FirstYearProgramClientProps) {
  const [lightboxImage, setLightboxImage] = useState<PhotoLightboxImage | null>(
    null,
  );

  return (
    <>
      <FTPBanner />
      <DepositConfirmedBanner />
      <div className="flex-col justify-center px-2 items-center w-full max-w-full">
        <div
          className="pb-6 flex flex-col items-center w-full"
          id="program-description"
        >
          {/* Hero */}
          <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
            <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
              From pregnancy through the first year
            </p>
            <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
              First Year Program
            </h1>
            <p className="mt-4 mb-2 text-lg max-w-xl">
              Amsterdam's <b>postpartum experts and parents, together</b>. A
              support system for your whole family through your baby's first
              year.
            </p>
          </div>

          <div className="mt-6 mb-8">
            <ShowcaseButton
              href="#join"
              title="Find your place"
              fill={true}
              umamiName="First Year Program: Join program"
            />
          </div>

          <div className="max-w-xl">
            <p className="mb-6 mx-4">
              When your kraamzorg and midwife move on, we step in to bridge the
              gap between expert and peer guidance through early parenthood.{" "}
              <b>
                We built the support so you don't have to — all you have to do
                is show up.
              </b>
            </p>
            <p className="mb-6 mx-4">
              The program is a{" "}
              <b>
                community labor of love from local parents and postpartum
                experts
              </b>
              . It's built by psychologists, lactation consultants,
              return-to-work specialists, postpartum coaches, and more, plus the
              founders of APP — who stood up this whole organization in the
              first place because they felt this support gap firsthand with
              their babies.
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-6 mb-12 px-4 w-full max-w-xl">
            <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-6 md:mb-12">
              The four support pillars we believe in
            </h2>
            <div className="flex flex-col gap-2">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:grid md:items-center gap-1 md:gap-4 py-2 md:min-h-[5rem]"
                  style={{ gridTemplateColumns: "1fr auto 1fr" }}
                >
                  <div className="flex items-center gap-3 md:contents">
                    <span className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-brand-goldenrod text-base font-bold text-brand-charcoal whitespace-nowrap">
                      {item.icon} {item.feature}
                    </span>
                    <MoveRight
                      className="text-brand-soft-green dark:text-brand-goldenrod shrink-0"
                      size={20}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="text-sm text-brand-charcoal/70 dark:text-brand-white/60 italic md:hidden ml-4 mt-1">
                    {item.scenario}
                  </span>
                  <span className="hidden md:block text-sm text-brand-charcoal/70 dark:text-brand-white/60 italic">
                    {item.scenario}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Community gallery */}
          <section className="py-8 max-w-5xl mx-auto w-full">
            <SectionHeader
              header="What it looks like in practice"
              subtitle="Café meetups, museum outings, and park walks — real families in the program, meeting up around Amsterdam."
            />
            <PhotoGallery items={communityPhotos} />
          </section>

          {/* Journey */}
          <section className="py-8 px-4 max-w-4xl mx-auto flex items-center flex-col justify-center">
            <SectionHeader
              header="How it works"
              subtitle="Join in pregnancy and the whole family gets immediate support — free (and refundable) until your baby arrives. Already have a baby? Jump right in. Support is there for you when and where you need it, for as long as you need."
            />
            <ProgramJourney />
          </section>

          {/* Curriculum */}
          <section className="mt-10 mb-8">
            <SectionHeader
              header="Expert & social curriculum"
              subtitle={
                <>
                  Evidence-based, expert-led discussions and resource guides
                  covering every major transition in your first year — from
                  newborn basics to returning to work. Topics rotate every 6
                  months so the conversation deepens as your family grows. Each
                  month also pairs with a themed social, so you can meet other
                  families in person around Amsterdam.
                </>
              }
            />

            <div className="max-w-4xl mx-auto mb-10 grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
              {programMomentPhotos.map((photo) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setLightboxImage(photo)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-brand-sand/60 cursor-zoom-in"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 45vw, 30vw"
                    className="object-cover"
                  />
                </button>
              ))}
              <figure className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => setLightboxImage(expertSessionPhoto)}
                  className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-brand-sand/60 cursor-zoom-in"
                >
                  <Image
                    src={expertSessionPhoto.src}
                    alt={expertSessionPhoto.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 30vw"
                    className="object-cover"
                  />
                </button>
                <figcaption className="text-center text-xs text-brand-soft-charcoal/60 dark:text-brand-white/50 italic mt-2">
                  Expert discussions happen live online, so you never have to
                  leave the house.
                </figcaption>
              </figure>
            </div>

            <MonthlyJourneyGrid />
          </section>

          {/* Costs */}
          <section className="mb-10 text-center">
            <SectionHeader
              header="Program fees"
              subtitle={
                <>
                  As a nonprofit, we strive to balance access with fair pay for
                  our experts and facilitators. If price is a barrier, please{" "}
                  <Link
                    href="mailto:hello@amsterdamparentproject.nl"
                    className="text-brand-goldenrod hover:text-brand-soft-green"
                  >
                    contact us
                  </Link>{" "}
                  — we&apos;re happy to accommodate your needs.
                </>
              }
            />
            <CostsBreakdown />
          </section>

          {/* Join */}
          <section id="#join">
            <FYPJoinForm
              initialFirstName={initialFirstName}
              initialLastName={initialLastName}
              initialEmail={initialEmail}
              initialMonth={initialMonth}
              initialYear={initialYear}
            />
          </section>
        </div>

        {/* FAQ */}
        <div id="faq" className="scroll-m-32 mt-6">
          <SectionHeader
            header="Common questions"
            subtitle={
              <>
                If you have any other questions, please{" "}
                <a
                  href="mailto:hello@amsterdamparentproject.nl"
                  className="text-brand-goldenrod hover:text-brand-soft-green"
                >
                  contact us
                </a>
                .
              </>
            }
          />
          <ProgramFAQ />
        </div>
      </div>

      <PhotoLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
