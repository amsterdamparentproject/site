// Uploads FYP resource guide PDFs (see fyp-plan-access.md,
// lib/fyp/resources.ts) from guides-source/ to the private `fyp-guides`
// Supabase Storage bucket, creating the bucket first if it doesn't exist.
//
// Run via yarn — picks the Supabase project from an explicit CLI flag, not
// from shell environment state:
//
//   yarn update-fyp-guides            # TEST project (default)
//   yarn update-fyp-guides --test     # TEST project (explicit)
//   yarn update-fyp-guides --prod     # prod project
//
// Rewritten 2026-07-31, renamed from setup-fyp-guides-bucket.mjs — the old
// version relied on `set -a && source .env.X && set +a` plus a `??`
// fallback between NEXT_PUBLIC_TEST_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_URL, which silently picked the wrong project twice
// in one afternoon: `source` only sets vars a file mentions, it never
// unsets ones it doesn't, so leftover TEST_* vars exported by an earlier
// `source` in the same terminal outranked freshly-sourced prod vars with
// no error at all. It also broke outright once on FYP_WHATSAPP_URL's
// unescaped `&`s, which bash's `source` parses as control operators.
//
// This version never touches the shell environment or process.env — it
// reads and parses .env.production (--prod) or .env.local (--test) itself,
// line by line, so the target is fully determined by the flag you pass,
// never by shell history, and quoting/`&`-in-a-URL is a non-issue since the
// value is never handed to bash at all.
//
// No versioning: uploads use upsert:true (re-uploading a storagePath
// overwrites it in the bucket, old version gone) and guides-source/ is
// gitignored, so there's no history layer at all. Confirmed acceptable with
// Alex 2026-07-29 — source PDFs are also kept in Drive/Canva, so this
// script's copy isn't the only one.
//
// ── Adding a new guide (workflow) ──────────────────────────────────────────
// 1. Drop the PDF in guides-source/ (gitignored — never committed, never
//    public). Create the folder if it doesn't exist yet.
// 2. Run `yarn update-fyp-guides --test`, confirm it looks right in the
//    Hub, then `yarn update-fyp-guides --prod` — uploads every file in
//    guides-source/ as-is, no separate list to maintain (storage path ==
//    filename, always).
// 3. Add a matching entry to the session's guideFiles array in
//    data/first-year-program/curriculum.ts — the bucket upload alone
//    doesn't make a guide show up in the Hub, both places need updating
//    together.

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "fyp-guides";
const SOURCE_DIR = "guides-source";

const args = process.argv.slice(2);
const wantsProd = args.includes("--prod");
const wantsTest = args.includes("--test");

if (wantsProd && wantsTest) {
  console.error("Pass either --prod or --test, not both.");
  process.exit(1);
}

const target = wantsProd ? "prod" : "test"; // test is the default
const envFile = target === "prod" ? ".env.production" : ".env.local";
const urlKey =
  target === "prod"
    ? "NEXT_PUBLIC_SUPABASE_URL"
    : "NEXT_PUBLIC_TEST_SUPABASE_URL";
const keyKey =
  target === "prod"
    ? "SUPABASE_SERVICE_ROLE_KEY"
    : "TEST_SUPABASE_SERVICE_ROLE_KEY";

// Parses envFile's own KEY=value lines directly rather than sourcing it —
// deliberately never touches process.env or a shell. Strips a single
// matching pair of surrounding quotes if present, so a quoted value (e.g.
// FYP_WHATSAPP_URL's, quoted specifically because of its "&"s — see this
// file's header) reads the same as an unquoted one.
function readEnvValue(path, key) {
  let content;
  try {
    content = readFileSync(path, "utf-8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`${path} not found.`);
      process.exit(1);
    }
    throw err;
  }

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    if (line.slice(0, eq).trim() !== key) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return undefined;
}

const supabaseUrl = readEnvValue(envFile, urlKey);
const serviceRoleKey = readEnvValue(envFile, keyKey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    `Missing ${urlKey}/${keyKey} in ${envFile} — check that file has both set.`,
  );
  process.exit(1);
}

console.log(`Target: ${target} (${envFile}) — ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (!buckets.some((b) => b.name === BUCKET)) {
    console.log(`Creating private bucket "${BUCKET}"...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: false,
    });
    if (createError) throw createError;
  } else {
    console.log(`Bucket "${BUCKET}" already exists — skipping creation.`);
  }

  // Upload every file found in guides-source/ as-is — no separate list to
  // maintain, storage path is always just the filename.
  let filenames;
  try {
    filenames = readdirSync(SOURCE_DIR).filter((name) => !name.startsWith("."));
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(
        `${SOURCE_DIR}/ doesn't exist yet — create it and add guide PDFs first.`,
      );
      return;
    }
    throw err;
  }

  if (filenames.length === 0) {
    console.log(`No files found in ${SOURCE_DIR}/ — nothing to upload.`);
    return;
  }

  for (const filename of filenames) {
    console.log(
      `Uploading ${SOURCE_DIR}/${filename} -> ${BUCKET}/${filename}...`,
    );
    const file = readFileSync(join(SOURCE_DIR, filename));
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadError) throw uploadError;
  }

  console.log(`Done — uploaded to ${target} (${supabaseUrl}).`);
}

main().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
