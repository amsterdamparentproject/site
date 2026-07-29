"use server";

import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

const isLocal =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

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

export const postSpotlight = async (data) => {
  // TODO: Create submission flow for Expert & Community Spotlights
  const url = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;
  return postToWebhook(url, data);
};
