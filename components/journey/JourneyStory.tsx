import HighlightPill from "@/components/journey/HighlightPill";
import StageJumpNav from "@/components/journey/StageJumpNav";
import { journeyPrograms } from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// JourneyStory — the "journey" view of /journey: the happy-path narrative,
// told in order, from finding out you're expecting through toddlerhood.
// Program names are inlined as HighlightPill links right where they enter
// the story, using the same accent colors as SupportGrid so a reader who's
// seen the grid recognizes them on sight.
//
// Each <section> is anchored (id="stage-<key>") so StageJumpNav can scroll a
// reader straight to their own stage — the story itself never collapses or
// filters, since the point is to sell the whole arc, not just one moment
// in it.
// ---------------------------------------------------------------------------

const seasonGroup = journeyPrograms.find((p) => p.name === "Season Groups")!;
const postpartumPost = journeyPrograms.find(
  (p) => p.name === "Postpartum Post",
)!;
const firstYearProgram = journeyPrograms.find(
  (p) => p.name === "First Year Program",
)!;
const newsletter = journeyPrograms.find((p) => p.name === "Newsletter")!;
const groupsDirectory = journeyPrograms.find(
  (p) => p.name === "Groups Directory",
)!;

const proseStyle =
  "space-y-5 text-lg leading-relaxed text-brand-charcoal/90 dark:text-brand-white/85";
const eyebrowStyle = "font-bold text-2xl text-brand-charcoal mb-3";

export default function JourneyStory() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <StageJumpNav />

      <div className="relative">
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-soft-green via-brand-goldenrod to-brand-violet" />

        {/* Pregnancy */}
        <section
          id="stage-pregnancy"
          className="relative pl-8 pb-14 scroll-mt-32"
        >
          <span className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-soft-green ring-4 ring-brand-white dark:ring-brand-charcoal" />
          <p className={eyebrowStyle}>Pregnancy</p>
          <div className={proseStyle}>
            <p>
              You find out you're expecting a baby here in Amsterdam, and
              immediately want to start building community. You join your{" "}
              <HighlightPill program={seasonGroup} /> — a{" "}
              <strong className={seasonGroup.accentText}>
                free WhatsApp community with expecting families
              </strong>{" "}
              giving birth in Amsterdam around the same time as you.
            </p>
            <p>
              As you start to build your village, you crave{" "}
              <strong className={postpartumPost.accentText}>
                deeper connections with local families around you
              </strong>{" "}
              — not just those due around the same time.{" "}
              <HighlightPill program={postpartumPost} /> matches you for coffee
              with the parent down the street who can share all the neighborhood
              tips, or the new local mom who gave birth just a few months ago
              and can hold your hand and answer your questions. As your due date
              approaches, you feel grounded and ready for what's to come.
            </p>
          </div>
        </section>

        {/* Newborn */}
        <section
          id="stage-newborn"
          className="relative pl-8 pb-14 scroll-mt-32"
        >
          <span className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-goldenrod ring-4 ring-brand-white dark:ring-brand-charcoal" />
          <p className={eyebrowStyle}>Newborn</p>
          <div className={proseStyle}>
            <p>
              Your baby is born, and happy chaos floods in — sleepless nights,
              feeding struggles, raging hormones, relationship changes. You find
              yourself up at 3am asking Google, AI, or giant WhatsApp groups for
              advice, and in return get hit with an overwhelming amount of info
              and opinions. It's hard to know what and whom to trust, and your
              energy is depleted. <HighlightPill program={firstYearProgram} />{" "}
              is there to help you{" "}
              <strong className={firstYearProgram.accentText}>
                cut through the noise — local experts and fellow parents coming
                together to hold your whole family postpartum
              </strong>
              . Expert chats and fun socials with a core group of committed
              families help you settle into new parenthood in Amsterdam.
            </p>
          </div>
        </section>

        {/* Baby */}
        <section id="stage-baby" className="relative pl-8 pb-14 scroll-mt-32">
          <span className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-dark-sand ring-4 ring-brand-white dark:ring-brand-charcoal" />
          <p className={eyebrowStyle}>Baby</p>
          <div className={proseStyle}>
            <p>
              Your baby gets a little older, and you find yourself wanting to
              leave the house more and more — but{" "}
              <strong className={newsletter.accentText}>
                where can you safely bring your baby and have fun with them?
              </strong>{" "}
              The <HighlightPill program={newsletter} /> lists local activities
              happening in Amsterdam for families with babies and toddlers every
              two weeks, so you always know what's available across the city.
            </p>
          </div>
        </section>

        {/* Toddler */}
        <section id="stage-toddler" className="relative pl-8 scroll-mt-32">
          <span className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-violet ring-4 ring-brand-white dark:ring-brand-charcoal" />
          <p className={eyebrowStyle}>Toddler</p>
          <div className={proseStyle}>
            <p>
              As your baby grows into a toddler, you're on the move and want
              company. <HighlightPill program={postpartumPost} /> helps you plan
              playground dates with families around the corner with kids in the
              same stage as yours — so you always have{" "}
              <strong className={postpartumPost.accentText}>
                plans for your mamadag/papadag afternoons
              </strong>
              .
            </p>
            <p>
              Your needs also keep changing, and the{" "}
              <HighlightPill program={groupsDirectory} /> has{" "}
              <strong className={groupsDirectory.accentText}>
                over 100 groups to help you navigate it all
              </strong>
              . Maybe you need new rain gear or age-appropriate toys, so you
              graduate to the 2-3 year Buy/Sell group. Or maybe you want to ask
              a bunch of neighborhood parents about their experiences with the
              elementary schools in your area.
            </p>
          </div>
        </section>
      </div>

      <p className="text-center text-2xl md:text-3xl font-bold leading-snug text-brand-charcoal dark:text-brand-white max-w-xl mx-auto mt-16 px-4">
        APP supports your family all along the journey of new parenthood: from
        the first ultrasound picture to their first day of school.
      </p>
    </div>
  );
}
