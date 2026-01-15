"use server";

export const postEventToWebhook = async (data) => {
  const webhookURL = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;
  const authSecret = process.env.N8N_WEBHOOK_SECRET;

  try {
    if (!webhookURL || !authSecret) {
      console.error("Missing environment variables");
      return { success: false, error: "Configuration Error" };
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

    console.log("postEventToWebhook isOk: ", isOk);

    return { success: isOk, status: statusCode };
  } catch (error) {
    console.error("postEventToWebhook error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};
