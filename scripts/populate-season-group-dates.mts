/**
 * One-off / rerunnable script — backfills due_start/due_end on every
 * existing Season Group row in directory.groups, following the six-month
 * season convention Alex set (2026-08-31):
 *
 *   Spring/Summer <year>          due_start = <year>-03-01, due_end = <year>-08-31
 *   Autumn/Winter <year>-<year+1> due_start = <year>-09-01, due_end = <year+1>-02-(28|29)
 *
 * UPDATE ONLY — this never creates a group row. A season with no matching
 * existing row is printed as skipped, not inserted (confirmed with Alex
 * 2026-08-31: creating a row here would mean a placeholder with no real
 * WhatsApp/Facebook invite link and guessed categories/platform — that
 * should be a deliberate, manual decision, not something this script does
 * on a rerun).
 *
 * No years are passed in — this fetches every group in the db, parses the
 * year out of any name matching "Spring/Summer <year> Parents Amsterdam" or
 * "Autumn/Winter <year>-<year+1> Parents Amsterdam", and backfills dates
 * for all of those, plus this year and next (so a newly-created current/
 * upcoming-season row gets picked up on the next run without needing a
 * flag — but nothing is ever created here if it's still missing).
 *
 * Matches EXISTING rows by exact name, which is the real naming convention
 * already in use (confirmed against the live directory.groups table
 * 2026-08-31; an earlier version of this script guessed a different
 * "Season Group — ..." format and also filtered existing rows by
 * categories containing "Season", which these legacy rows don't have —
 * that would have missed every real row). This version fetches ALL groups,
 * not just "Season"-tagged ones, and matches purely on name.
 *
 * Some seasons have MORE THAN ONE row sharing the exact same name (seen in
 * the live data: two "Autumn/Winter 2024-2025 Parents Amsterdam" rows, two
 * "Spring/Summer 2024 Parents Amsterdam" rows) — confirmed with Alex
 * 2026-08-31: these are legitimate platform variants of the same season
 * (e.g. a WhatsApp group and a Facebook group for the same cohort), not a
 * data problem, and they share the same due_start/due_end. This script
 * updates EVERY row that matches a target name, not just one, and prints
 * each match's platform alongside it so it's clear which row is which.
 *
 * Always prints the full list of every group in the db, the years it
 * derived, and the plan (update vs. skip, with before/after dates), and
 * asks for Y/N confirmation before writing anything.
 *
 *   yarn season-group-dates:test              # TEST project
 *   yarn season-group-dates:prod              # prod
 *   yarn season-group-dates:prod --dry-run    # plan only, writes nothing
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { createInterface } from "readline/promises";
import { createServiceClient } from "../lib/supabase/server.ts";

const env = process.argv[2];
if (env !== "test" && env !== "prod") {
  console.error(
    "Usage: tsx scripts/populate-season-group-dates.mts <test|prod> [--dry-run]",
  );
  process.exit(1);
}

const dryRun = process.argv.slice(3).includes("--dry-run");

const envFile = env === "prod" ? ".env.production" : ".env.test";
dotenv.config({ path: resolve(process.cwd(), envFile) });

console.log(`Env file: ${envFile}`);
console.log(`Target Supabase project: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

interface SeasonDef {
  name: string;
  due_start: string;
  due_end: string;
}

/** Last calendar day of `month` (1-indexed) in `year`, as YYYY-MM-DD — handles Feb in leap years. */
function lastDayOfMonth(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month, 0)); // day 0 of next month = last day of this one
  return date.toISOString().slice(0, 10);
}

function seasonDefsForYear(year: number): SeasonDef[] {
  return [
    {
      name: `Spring/Summer ${year} Parents Amsterdam`,
      due_start: `${year}-03-01`,
      due_end: `${year}-08-31`,
    },
    {
      name: `Autumn/Winter ${year}-${year + 1} Parents Amsterdam`,
      due_start: `${year}-09-01`,
      due_end: lastDayOfMonth(year + 1, 2),
    },
  ];
}

const SPRING_SUMMER_RE = /^Spring\/Summer (\d{4}) Parents Amsterdam$/;
const AUTUMN_WINTER_RE = /^Autumn\/Winter (\d{4})-\d{4} Parents Amsterdam$/;

/** Years already represented in the db, parsed straight out of matching names. */
function yearsFromExistingNames(rows: ExistingRow[]): number[] {
  const years = new Set<number>();
  for (const row of rows) {
    const ss = row.name.match(SPRING_SUMMER_RE);
    if (ss) years.add(Number(ss[1]));
    const aw = row.name.match(AUTUMN_WINTER_RE);
    if (aw) years.add(Number(aw[1]));
  }
  return [...years];
}

interface ExistingRow {
  id: string;
  name: string;
  categories: string[];
  platform: string | null;
  due_start: string | null;
  due_end: string | null;
}

async function main() {
  const supabase = createServiceClient("directory");

  // Fetch every group, not just ones already tagged "Season" — these
  // legacy rows predate that tag, so filtering on it would miss them all.
  const { data: allGroups, error: listError } = await supabase
    .from("groups")
    .select("id, name, categories, platform, due_start, due_end")
    .order("name");

  if (listError) {
    console.error("Failed to read directory.groups:", listError);
    process.exit(1);
  }

  const existing = (allGroups ?? []) as ExistingRow[];
  console.log(`\nAll groups currently in the db (${existing.length}):`);
  for (const row of existing) {
    console.log(
      `  - "${row.name}" [${row.id}]: due ${row.due_start ?? "—"} → ${row.due_end ?? "—"}, categories: [${row.categories?.join(", ") ?? ""}]`,
    );
  }

  const now = new Date();
  const years = Array.from(
    new Set([
      ...yearsFromExistingNames(existing),
      now.getFullYear(),
      now.getFullYear() + 1,
    ]),
  ).sort((a, b) => a - b);
  console.log(
    `\nYears in scope (parsed from existing rows, plus this year and next): ${years.join(", ")}`,
  );

  const targets = years.flatMap(seasonDefsForYear);

  // Group existing rows by exact name so a name shared by 2+ rows (seen
  // live: duplicate Autumn/Winter 2024-2025 and Spring/Summer 2024 rows)
  // is visible rather than silently resolved.
  const byName = new Map<string, ExistingRow[]>();
  for (const row of existing) {
    const bucket = byName.get(row.name) ?? [];
    bucket.push(row);
    byName.set(row.name, bucket);
  }

  const plan = targets.map((target) => ({
    target,
    matches: byName.get(target.name) ?? [],
  }));

  console.log("\nPlan (update only — never creates a row):");
  for (const { target, matches } of plan) {
    if (matches.length === 0) {
      console.log(
        `  SKIP "${target.name}": no matching group in the db — not creating one.`,
      );
    } else {
      for (const m of matches) {
        const alreadyCorrect =
          m.due_start === target.due_start && m.due_end === target.due_end;
        console.log(
          `  UPDATE "${target.name}" [${m.id}]${matches.length > 1 ? ` (platform: ${m.platform ?? "—"})` : ""}: ${m.due_start ?? "—"} → ${m.due_end ?? "—"}  ==>  ${target.due_start} → ${target.due_end}${alreadyCorrect ? "  (already correct)" : ""}`,
        );
      }
    }
  }

  const toWrite = plan.filter((p) => p.matches.length > 0);
  const writeCount = toWrite.reduce((sum, p) => sum + p.matches.length, 0);

  if (dryRun) {
    console.log("\n--dry-run: no changes written.");
    return;
  }

  if (writeCount === 0) {
    console.log("\nNothing to update — no changes written.");
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `\nUpdate ${writeCount} row(s) in ${env.toUpperCase()}? (Y/N) `,
  );
  rl.close();

  if (answer.trim().toLowerCase() !== "y") {
    console.log("Aborted — no changes written.");
    return;
  }

  const results: { name: string; ok: boolean; error?: string }[] = [];

  for (const { target, matches } of toWrite) {
    for (const m of matches) {
      const { error } = await supabase
        .from("groups")
        .update({
          due_start: target.due_start,
          due_end: target.due_end,
          categories: m.categories?.includes("Season")
            ? m.categories
            : [...(m.categories ?? []), "Season"],
        })
        .eq("id", m.id);
      results.push({
        name: `${target.name}${matches.length > 1 ? ` [${m.platform ?? m.id}]` : ""}`,
        ok: !error,
        error: error?.message,
      });
    }
  }

  console.log("\nResults:");
  for (const r of results) {
    console.log(
      r.ok ? `  ✓ update ${r.name}` : `  ✗ update ${r.name}: ${r.error}`,
    );
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
