"use server";

const postToWebhook = async (webhookURL, data) => {
  const authSecret = process.env.N8N_WEBHOOK_SECRET;

  try {
    if (!webhookURL || !authSecret) {
      console.error("postToWebhook error: Missing environment variables");
      return { success: false, error: "Configuration error" };
    }

    const response = await fetch(webhookURL, {
      method: "POST",
      headers: {
        "X-N8N-WEBHOOK-SECRET": authSecret,
      },
      body: data,
    });

    const isOk = !!response.ok;
    const statusCode = Number(response.status);

    return { success: isOk, status: statusCode };
  } catch (error) {
    console.error("postToWebhook error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

export const postEvent = async (data) => {
  const url = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;
  return postToWebhook(url, data);
};

export const postSpotlight = async (data) => {
  // TODO: Create submission flow for Expert & Community Spotlights
  const url = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;
  return postToWebhook(url, data);
};
