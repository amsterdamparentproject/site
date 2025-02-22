"use server";

import { BeehiivClient } from "@beehiiv/sdk";

const apiKey = process.env.NEXT_PUBLIC_BEEHIIV_API_KEY;
const pubId = process.env.NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID;

const testAPISubId = "sub_cc4c8ce7-0c0e-4884-bfd5-51bfa99c8673";

const subscribe = async (Props) => {
  const { email, tag, referringSite } = Props;

  if (apiKey && pubId) {
    const client = new BeehiivClient({ token: apiKey });

    const subscriber = await client.subscriptions.create(pubId, {
      email,
      referringSite,
      utmSource: "direct",
      utmMedium: "website",
    });

    client.subscriptionTags.create(pubId, subscriber.data.id, { tags: tag });
  }
};

export default subscribe;
