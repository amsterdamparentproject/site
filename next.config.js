const { withContentlayer } = require("next-contentlayer2");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.beehiiv.com *.stripe.com cloud.umami.is;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.s3.amazonaws.com;
  connect-src *;
  font-src 'self';
  frame-src 'self' embeds.beehiiv.com js.stripe.com;
`;

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\n/g, ""),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const output = process.env.EXPORT ? "export" : undefined;
const basePath = process.env.BASE_PATH || undefined;
const unoptimized = process.env.UNOPTIMIZED ? true : undefined;

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer];
  return plugins.reduce((acc, next) => next(acc), {
    output,
    basePath,
    // Allow an isolated build directory (e.g. for Playwright's dev server) so
    // two Next servers never write to the same .next dir concurrently, which
    // corrupts the webpack manifest ("Cannot find module './1331.js'").
    distDir: process.env.NEXT_DIST_DIR || ".next",
    reactStrictMode: true,
    experimental: {
      serverActions: {
        bodySizeLimit: '6mb', // Accept image upload size up to Netlify's max limit
      },
    },
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    eslint: {
      dirs: ["app", "components", "layouts", "scripts"],
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "picsum.photos",
        },
      ],
      unoptimized,
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: securityHeaders,
        },
        // Cache static marketing pages aggressively at the CDN edge.
        // stale-while-revalidate lets Netlify serve a stale copy instantly
        // while it fetches a fresh one in the background.
        {
          source: "/",
          headers: [
            {
              key: "Cache-Control",
              value: "public, s-maxage=3600, stale-while-revalidate=86400",
            },
          ],
        },
        {
          source: "/calendar",
          headers: [
            {
              key: "Cache-Control",
              value: "public, s-maxage=3600, stale-while-revalidate=86400",
            },
          ],
        },
      ];
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      });

      return config;
    },
  
    async rewrites() {
      return [
        {
          source: '/stats/:path*',
          destination: 'https://cloud.umami.is/:path*',
        },
      ]
    },
    async redirects() {
      return [
        // Basic redirect
        {
          source: '/newsletter',
          destination: 'https://amsterdamparentproject.beehiiv.com/',
          permanent: true,
        },
        {
          source: '/instagram',
          destination: 'https://www.instagram.com/amsterdamparentproject',
          permanent: true,
        },
        {
          source: '/programs/fourth-trimester',
          destination: '/programs/first-year?from=fourth-trimester',
          permanent: true,
        },
        {
          source: '/fyp',
          destination: '/programs/first-year',
          permanent: true,
        },
        {
          source: '/advice/submit',
          destination: 'https://docs.google.com/forms/d/e/1FAIpQLSdsywfv8a0KxpVM1yIYg4TJmm1mr3NtMB6i1ogESG0idDYZyg/viewform?usp=sf_link',
          permanent: true,
        },
        {
          source: '/advice/community-spotlight/:slug*',
          destination: '/stories/:slug*',
          permanent: true,
        },
        {
          source: '/advice/expert-spotlight/:slug*',
          destination: '/stories/:slug*',
          permanent: true,
        },
        {
          source: '/advice/community-spotlight',
          destination: '/stories',
          permanent: true,
        },
        {
          source: '/advice/expert-spotlight',
          destination: '/stories',
          permanent: true,
        },
        {
          source: '/stories/community-spotlight/:slug*',
          destination: '/stories/:slug*',
          permanent: true,
        },
        {
          source: '/stories/expert-spotlight/:slug*',
          destination: '/stories/:slug*',
          permanent: true,
        },
        {
          source: '/stories/community-spotlight',
          destination: '/stories',
          permanent: true,
        },
        {
          source: '/stories/expert-spotlight',
          destination: '/stories',
          permanent: true,
        },
        {
          source: '/community-calendar',
          destination: '/calendar',
          permanent: true,
        },
        {
          source: '/newsletter/build',
          destination: 'https://the-siegas.app.n8n.cloud/form/73f32c7f-2caf-45cb-818a-e96b352a2845', // Auth on the form to prevent expensive API calls
          permanent: true,
        },
        {
          source: '/meet',
          destination: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3m4sBfJ8NENWuP7gUaz7CeeGLJAAAxpcHfxeMPEeI6hzur3pn6EIiH0uVpqyrVoePy_BszUDmO",
          permanent: true,
        },
        {
          source: '/add-event',
          destination: "/calendar/submit-event",
          permanent: true,
        },
        // /tags removed — redirects to /read or /stories with series filter
        {
          source: '/tags/expert-spotlight',
          destination: '/stories?series=expert-spotlight',
          permanent: true,
        },
        {
          source: '/tags/community-spotlight',
          destination: '/stories?series=community-spotlight',
          permanent: true,
        },
        {
          source: '/tags/founder-notes',
          destination: '/stories?series=founder-notes',
          permanent: true,
        },
        {
          source: '/tags/:tag',
          destination: '/read',
          permanent: true,
        },
        {
          source: '/tags',
          destination: '/read',
          permanent: true,
        },
      ]
    },
  });
};
