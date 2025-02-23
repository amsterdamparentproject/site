"use server";

import { BeehiivClient } from "@beehiiv/sdk";

const apiKey = process.env.BEEHIIV_API_KEY;
const pubId = process.env.BEEHIIV_PUBLICATION_ID;

const subscribeToNewsletter = async (Props) => {
  const { email, tag, referringSite } = Props;

  if (apiKey && pubId) {
    const client = new BeehiivClient({ token: apiKey });

    const subscriber = await client.subscriptions.create(pubId, {
      email,
      referringSite,
      utmSource: "direct",
      utmMedium: "website",
    });

    client.subscriptionTags.create(pubId, subscriber.data.id, { tags: [tag] });
  }
};

export default subscribeToNewsletter;
