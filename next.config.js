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
    reactStrictMode: true,
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
      ];
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      });

      return config;
    },
    serverActions: {
      bodySizeLimit: '6mb', // Accept image upload size up to Netlify's max limit
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
          source: '/programs/burnout/apply',
          destination: 'https://docs.google.com/forms/d/e/1FAIpQLSf5buxK4oEJxUOChHbbBVie5P7gUXJ2qsoR-xxweiixWCcjQw/viewform?usp=dialog',
          permanent: true,
        },
        {
          source: '/advice/submit',
          destination: 'https://docs.google.com/forms/d/e/1FAIpQLSdsywfv8a0KxpVM1yIYg4TJmm1mr3NtMB6i1ogESG0idDYZyg/viewform?usp=sf_link',
          permanent: true,
        },
        {
          source: '/community-calendar',
          destination: '/calendar',
          permanent: true,
        },
        {
          source: '/programs/fourth-trimester/jan-2026',
          destination: '/programs/fourth-trimester/join?cohort=jan-2026',
          permanent: true,
        },
        {
          source: '/newsletter/build',
          destination: 'https://the-siegas.app.n8n.cloud/form/73f32c7f-2caf-45cb-818a-e96b352a2845', // Auth on the form to prevent expensive API calls
          permanent: true,
        },
      ]
    },
  });
};
