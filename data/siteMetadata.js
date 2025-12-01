/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: "Amsterdam Parent Project",
  author: "Alex Siega",
  headerTitle: "Amsterdam Parent Project",
  description: "Parent-to-parent support, (em)powered by professionals",
  language: "en-us",
  theme: "light", // Start with light as the default
  siteUrl: "https://amsterdamparentproject.nl",
  siteRepo: "https://github.com/amsterdamparentproject/site",
  siteLogo: `${process.env.BASE_PATH || ""}/static/images/logo/light.png`,
  socialBanner: `${process.env.BASE_PATH || ""}/static/images/web-share.png`,
  email: "amsterdamparentproject@gmail.com",
  instagram: "https://www.instagram.com/amsterdamparentproject",
  roadmap: "https://trello.com/b/yUO7aIps/roadmap-amsterdam-parent-project-app",
  communityCalendar: {
    google:
      "https://calendar.google.com/calendar/u/0?cid=OGUyZTFlNWI0M2UxYzZjYjRiN2FiNmQ3OTc3N2U0ZGIzN2MyYjg4MzJmZTZmYWIyMDdkNWU4ZDdlN2IxNmZhOEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
    iCal: "https://calendar.google.com/calendar/ical/8e2e1e5b43e1c6cb4b7ab6d79777e4db37c2b8832fe6fab207d5e8d7e7b16fa8%40group.calendar.google.com/public/basic.ics",
  },
  locale: "en-US",
  stickyNav: true,
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      // We use an env variable for this site to avoid other users cloning our analytics ID
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
      // You may also need to overwrite the script if you're storing data in the US - ex:
      // src: 'https://us.umami.is/script.js'
      // Remember to add 'us.umami.is' in `next.config.js` as a permitted domain for the CSP
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // If you are hosting your own Plausible.
    //   src: '', // e.g. https://plausible.my-domain.com/js/script.js
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  newsletter: {
    // Please add your .env file and modify it according to your selection
    provider: "beehiiv",
  },
  search: {
    provider: "kbar",
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ""}/search.json`, // path to load documents to search
    },
  },
};

module.exports = siteMetadata;
