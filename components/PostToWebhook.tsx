"use server";

const isLocal = process.env.NODE_ENV === "development";

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
      console.error("postToWebhook error: Missing environment variables");
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

export const postEvent = async (data) => {
  const url = isLocal
    ? process.env.TEST_N8N_EVENT_SUBMIT_WEBHOOK_URL
    : process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;
  return postToWebhook(url, data);
};

export const postRequestDirectory = async (data) => {
  const url = isLocal
    ? process.env.TEST_N8N_REQUEST_DIRECTORY_WEBHOOK_URL
    : process.env.N8N_REQUEST_DIRECTORY_WEBHOOK_URL;
  return postToWebhook(url, data);
};

export const postManageDirectory = async (data, action = "add") => {
  const allowedActions = ["add", "report", "update"];

  if (!allowedActions.includes(action)) {
    console.error("postManageDirectory error: Invalid action", action);
    return { success: false, error: "Invalid action" };
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

  const result = await postToWebhook(url, formData);
  return result;
};

export const postSpotlight = async (data) => {
  // TODO: Create submission flow for Expert & Community Spotlights
  const url = process.env.N8N_EVENT_SUBMIT_WEBHOOK_URL;
  return postToWebhook(url, data);
};
