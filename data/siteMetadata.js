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
  newsletter: {
    provider: "beehiiv",
  },
  umamiAnalytics: {
    websiteId: process.env.UMAMI_ID,
  },
  search: {
    provider: "kbar",
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ""}/search.json`, // path to load documents to search
    },
  },
};

module.exports = siteMetadata;
