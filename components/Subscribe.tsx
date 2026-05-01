"use server";

import { BeehiivClient } from "@beehiiv/sdk";

const apiKey = process.env.BEEHIIV_API_KEY;
const pubId = process.env.BEEHIIV_PUBLICATION_ID;
const isLocal = process.env.NODE_ENV === "development";

const subscribeToNewsletter = async ({ email, tags, referringSite }) => {
  if (!apiKey || !pubId) {
    console.error("Missing Beehiiv configuration");
    return { success: false, error: "Configuration Error" };
  }

  try {
    const client = new BeehiivClient({ token: apiKey });

    // For testing: Set a local test tag to easily identify test subscriptions in the dashboard
    const getTags = (formTags) => {
      const baseTags = formTags || [];
      const dateTag = `test-${new Date().toLocaleString("sv-SE").replace(" ", "--").replace(/:/g, "-").slice(0, 17)}`;
      if (isLocal) {
        return [...baseTags, dateTag];
      }
      return baseTags;
    };

    const { data: subscriber } = await client.subscriptions.create(pubId, {
      email,
      referring_site: referringSite,
      utm_source: "direct",
      utm_medium: "website",
    });

    if (subscriber?.id) {
      await client.subscriptionTags.create(pubId, subscriber.id, {
        tags: getTags(tags),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Beehiiv Error:", error);
    return { success: false, error: error.message };
  }
};

export default subscribeToNewsletter;
