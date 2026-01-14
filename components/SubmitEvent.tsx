"use server";

export const postEventToWebhook = async (data) => {
  const webhookURL = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;

  try {
    const url = webhookURL;
    if (!url)
      throw new Error("postEventToWebhook error: Webhook URL is not defined");

    const response = await fetch(url, {
      method: "POST",
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
