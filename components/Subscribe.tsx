"use server";

import { BeehiivClient } from "@beehiiv/sdk";

const apiKey = process.env.BEEHIIV_API_KEY;
const pubId = process.env.BEEHIIV_PUBLICATION_ID;

const subscribeToNewsletter = async ({ email, tag, referringSite }) => {
  if (!apiKey || !pubId) {
    console.error("Missing Beehiiv configuration");
    return { success: false, error: "Configuration Error" };
  }

  try {
    const client = new BeehiivClient({ token: apiKey });

    const { data: subscriber } = await client.subscriptions.create(pubId, {
      email,
      referring_site: referringSite,
      utm_source: "direct",
      utm_medium: "website",
    });

    if (subscriber?.id) {
      await client.subscriptionTags.create(pubId, subscriber.id, {
        tags: [tag],
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Beehiiv Error:", error);
    return { success: false, error: error.message };
  }
};

export default subscribeToNewsletter;
