"use server";

const webhookURL = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;

const postEventToWebhook = async (data) => {
  if (webhookURL) {
    return await fetch(webhookURL, {
      method: "POST",
      body: data,
    });
  }
  throw new Error("Webhook URL not defined");
};
export default postEventToWebhook;
