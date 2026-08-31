import Link from "@/components/Link";
import type { JourneyProgram } from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// HighlightPill — the colored, clickable program name used inline inside
// JourneyStory's prose (e.g. "...craves deeper connections. [Postpartum
// Post] matches you..."). Same visual language (accent border/soft-bg/text)
// as the badges in SupportGrid, just sized to sit inside a line of text
// instead of standing alone in a card.
// ---------------------------------------------------------------------------

interface HighlightPillProps {
  program: Pick<
    JourneyProgram,
    "name" | "href" | "accentBorder" | "accentSoftBg" | "accentText"
  >;
}

export default function HighlightPill({ program }: HighlightPillProps) {
  return (
    <Link
      href={program.href}
      className={`inline-block whitespace-nowrap align-baseline mx-0.5 px-2.5 py-0.5 rounded-full border text-[0.9em] font-bold transition-opacity hover:opacity-70 ${program.accentBorder} ${program.accentSoftBg} ${program.accentText}`}
    >
      {program.name}
    </Link>
  );
}
