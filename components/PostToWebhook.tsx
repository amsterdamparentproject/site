"use server";

import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { isEmailBlocked } from "@/lib/supabase/queries/blocklist";
import { sendSpotlightSubmissionEmail } from "@/lib/emails/spotlight-submission";
import {
  spotlightTypes,
  type SpotlightType,
} from "@/data/spotlights/questions";

const isLocal =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

// Minimum time (ms) between the submit-event form rendering and being
// submitted. Real people take longer than this to fill out four fields;
// bots that fill and submit programmatically usually don't.
const MIN_SUBMIT_MS = 2000;

const postToWebhook = async (webhookURL, data) => {
  const authSecret = process.env.N8N_WEBHOOK_SECRET;

  let formData: FormData;

  if (data instanceof FormData) {
    formData = data;
  } else {
    formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
  }

  try {
    if (!webhookURL || !authSecret) {
      console.error("postToWebhook error: Missing environment variables", {
        hasWebhookURL: !!webhookURL,
        hasAuthSecret: !!authSecret,
        NODE_ENV: process.env.NODE_ENV,
      });
      return { success: false, error: "Configuration error" };
    }

    const response = await fetch(webhookURL, {
      method: "POST",
      headers: {
        "X-N8N-WEBHOOK-SECRET": authSecret,
      },
      body: formData,
    });

    const isOk = !!response.ok;
    const statusCode = Number(response.status);
    const responseText = await response.text();

    return { success: isOk, status: statusCode, response: responseText };
  } catch (error) {
    console.error("postToWebhook error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

export const postEvent = async (data: FormData) => {
  const title = data.get("title") as string;
  const url = data.get("url") as string;
  const email = data.get("email") as string;
  const notes = data.get("notes") as string;
  const imageFile = data.get("image") as File | null;
  const honeypot = data.get("hp_company") as string | null;
  const renderedAt = Number(data.get("ts"));

  // Bot check: honeypot field filled in, or submitted suspiciously fast
  // after the form rendered. Blocklist check: known spam email/domain.
  // Either way, fake a success response so spam senders see the same
  // "Success!" screen and get no signal that they were blocked — this
  // happens before the Storage upload and the n8n webhook call below, so a
  // blocked submission costs nothing and never reaches review.
  const isBot =
    !!honeypot?.trim() ||
    !renderedAt ||
    Date.now() - renderedAt < MIN_SUBMIT_MS;

  if (isBot || (await isEmailBlocked(email))) {
    console.warn("postEvent: blocked spam submission", {
      isBot,
      email,
    });
    return { success: true, status: 200, response: "ok" };
  }

  // Upload image to Supabase storage before sending to n8n so that the
  // webhook receives a public URL rather than raw binary data. This URL
  // then flows through the Slack review message and on to the Desk card.
  let file_url: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const supabase = createServiceClient("activities");
    const ext = imageFile.name.split(".").pop();
    const uploadId = crypto.randomUUID();
    const path = `captures/${uploadId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("activities")
      .upload(path, imageFile, { contentType: imageFile.type, upsert: true });
    if (uploadError) {
      console.error("Image upload failed:", uploadError.message);
    } else {
      file_url = supabase.storage.from("activities").getPublicUrl(path)
        .data.publicUrl;
    }
  }

  const webhookUrl = isLocal
    ? process.env.TEST_N8N_EVENT_SUBMIT_WEBHOOK_URL
    : process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;

  return postToWebhook(webhookUrl, { title, url, email, notes, file_url });
};

// Used by both /groups-directory/access (RequestAccessForm) and
// /season-groups (SeasonGroupSignupForm, for first-time visitors with no
// app_uid yet) — Season Groups joins through this same pipeline rather than
// a bespoke one. See __claude__/season-groups-join-flow.md.
export const postRequestDirectory = async (data) => {
  const url = isLocal
    ? process.env.TEST_N8N_REQUEST_DIRECTORY_WEBHOOK_URL
    : process.env.N8N_REQUEST_DIRECTORY_WEBHOOK_URL;
  return postToWebhook(url, data);
};

export const postManageDirectory = async (data, action = "add") => {
  console.log("[postManageDirectory] called", {
    action,
    isLocal,
    NODE_ENV: process.env.NODE_ENV,
    hasURL: !!process.env.TEST_N8N_MANAGE_DIRECTORY_WEBHOOK_URL,
    hasSecret: !!process.env.N8N_WEBHOOK_SECRET,
  });
  const allowedActions = ["add", "report", "update"];

  if (!allowedActions.includes(action)) {
    console.error("postManageDirectory error: Invalid action", action);
    return { success: false, error: "Invalid action", userCreated: false };
  }

  const url = isLocal
    ? process.env.TEST_N8N_MANAGE_DIRECTORY_WEBHOOK_URL
    : process.env.N8N_MANAGE_DIRECTORY_WEBHOOK_URL;

  // Add action to FormData if data is an object, or append to existing FormData
  let formData: FormData;
  if (data instanceof FormData) {
    formData = data;
    formData.append("action", action);
  } else {
    formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("action", action);
  }

  let userCreated = false;

  if (!(formData.get("email") as string)?.trim()) {
    // No email — resolve from cookie (app_uid = public_id)
    const cookieStore = await cookies();
    const uid = cookieStore.get("app_uid")?.value;
    if (uid) {
      const supabase = createServiceClient("directory");
      const { data: user } = await supabase
        .from("users")
        .select("id, email")
        .eq("public_id", uid)
        .single();
      if (user?.email) {
        formData.set("email", user.email);
        formData.set("userId", user.id);
        formData.set("publicId", uid);
      }
    }
  } else {
    // Email present — look up or create user so all three identifiers are in the payload
    const email = (formData.get("email") as string).trim();
    const supabase = createServiceClient("directory");
    const { data: user } = await supabase
      .from("users")
      .select("id, public_id")
      .eq("email", email)
      .single();

    if (user?.id) {
      formData.set("userId", user.id);
      formData.set("publicId", user.public_id);
    } else {
      // Create user and assign public_id. Crypto-secure (was Math.random —
      // audit S4); same 20-char [a-z0-9] format, so existing links and lookups
      // are unaffected — this only changes newly-minted ids.
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      const newPublicId = Array.from({ length: 20 }, () =>
        chars.charAt(randomInt(chars.length)),
      ).join("");
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({ public_id: newPublicId, email, name: null, categories: [] })
        .select("id")
        .single();
      if (!error && newUser?.id) {
        formData.set("userId", newUser.id);
        formData.set("publicId", newPublicId);
        userCreated = true;
      }
    }
  }

  // Resolve groupId — use originalGroupName for updates (new name doesn't exist yet),
  // fall back to groupName for adds (no originalGroupName present)
  const lookupName = (
    (formData.get("originalGroupName") as string) ||
    (formData.get("groupName") as string)
  )?.trim();
  if (lookupName) {
    const supabase = createServiceClient("directory");
    const { data: group } = await supabase
      .from("groups")
      .select("id")
      .eq("name", lookupName)
      .single();
    if (group?.id) formData.set("groupId", group.id);
  }

  const result = await postToWebhook(url, formData);
  return { ...result, userCreated };
};

// Expert & Community Spotlight submissions (app/contribute,
// components/SpotlightSubmitForm) email Alex directly via Resend rather
// than going through the n8n/Slack/Desk review pipeline postEvent uses —
// spotlights are low-volume and curated by Alex personally, so a direct
// email (with the photo(s) as real attachments, and — for the "answer
// here" method — a copy-paste-ready .mdx block) is simpler than standing
// up a new n8n workflow for this. Same bot-check as postEvent.
export const postSpotlight = async (data: FormData) => {
  const rawType = data.get("type") as string;
  const type: SpotlightType = spotlightTypes.includes(rawType as SpotlightType)
    ? (rawType as SpotlightType)
    : "community";
  const method: "doc" | "form" =
    (data.get("method") as string) === "doc" ? "doc" : "form";
  const name = ((data.get("name") as string) || "").trim();
  const email = ((data.get("email") as string) || "").trim();
  const docLink = ((data.get("docLink") as string) || "").trim();
  const occupation = ((data.get("occupation") as string) || "").trim();
  const company = ((data.get("company") as string) || "").trim();
  const website = ((data.get("website") as string) || "").trim();
  const instagram = ((data.get("instagram") as string) || "").trim();
  const linkedin = ((data.get("linkedin") as string) || "").trim();
  const oneAsk = ((data.get("oneAsk") as string) || "").trim();
  const honeypot = data.get("hp_company") as string | null;
  const renderedAt = Number(data.get("ts"));

  // Bot check: honeypot field filled in, or submitted suspiciously fast
  // after the form rendered. Blocklist check: known spam email/domain.
  // Same rationale as postEvent — fake a success response so spam senders
  // get no signal they were blocked, before any email is sent.
  const isBot =
    !!honeypot?.trim() ||
    !renderedAt ||
    Date.now() - renderedAt < MIN_SUBMIT_MS;

  if (isBot || (await isEmailBlocked(email))) {
    console.warn("postSpotlight: blocked spam submission", { isBot, email });
    return { success: true };
  }

  let bio: { label: string; answer: string }[] = [];
  let interview: { question: string; answer: string }[] = [];
  try {
    bio = JSON.parse((data.get("bioJSON") as string) || "[]");
  } catch {
    bio = [];
  }
  try {
    interview = JSON.parse((data.get("interviewJSON") as string) || "[]");
  } catch {
    interview = [];
  }

  // Up to 3 photos, 4.5MB each, 5MB combined — mirrors the client-side caps
  // in SpotlightSubmitForm (which is what actually keeps the request under
  // next.config.js's serverActions.bodySizeLimit; by the time code here
  // runs, an oversized body has already been rejected before it can reach
  // this function). Re-checked here anyway since the server is the only
  // real trust boundary.
  const MAX_PHOTO_SIZE = 4.5 * 1024 * 1024;
  const MAX_TOTAL_PHOTOS_SIZE = 5 * 1024 * 1024;
  const photoFiles = data
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 3);

  const attachments: { filename: string; content: Buffer }[] = [];
  let totalPhotoBytes = 0;
  for (const file of photoFiles) {
    if (file.size > MAX_PHOTO_SIZE) continue;
    if (totalPhotoBytes + file.size > MAX_TOTAL_PHOTOS_SIZE) continue;
    const arrayBuffer = await file.arrayBuffer();
    attachments.push({
      filename: file.name || "photo.jpg",
      content: Buffer.from(arrayBuffer),
    });
    totalPhotoBytes += file.size;
  }

  try {
    await sendSpotlightSubmissionEmail(
      {
        type,
        method,
        name,
        email,
        docLink: docLink || undefined,
        bio,
        interview,
        photoCount: attachments.length,
        oneAsk: oneAsk || undefined,
        profile: { occupation, company, website, instagram, linkedin },
      },
      attachments,
    );
    return { success: true };
  } catch (error) {
    console.error("postSpotlight error:", error);
    return {
      success: false,
      error: "Something went wrong sending your submission.",
    };
  }
};
