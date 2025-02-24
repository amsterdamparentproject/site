/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check
/** @type {import("tailwindcss").Config } */
module.exports = {
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            p: {
              color: theme("--color-brand-charcoal"),
            },
            a: {
              color: theme("--color-brand-soft-green"),
              "&:hover": {
                color: theme("--color-brand-goldenrod"),
              },
            },
            "h1,h2": {
              color: theme("--color-brand-charcoal"),
              fontWeight: "700",
              letterSpacing: theme("--tracking-tight"),
            },
            h3: {
              fontWeight: "600",
            },
            "b, strong": {
              color: theme("--color-brand-charcoal"),
            },
            blockquote: {
              backgroundColor: theme("--color-brand-soft-green"),
              borderColor: theme("--color-brand-goldenrod"),
              p: {
                "&:first-of-type::before": { content: "none" },
                "&:first-of-type::after": { content: "none" },
                color: theme("--color-brand-white"),
                "b, strong": {
                  color: theme("--color-brand-goldenrod"),
                },
                fontStyle: "normal",
                fontSize: "1.1em",
                padding: "1.5em",
              },
            },
          },
        },
        invert: {
          css: {
            "p,ul,ol,span": {
              color: theme("--color-brand-white"),
              strong: {
                color: theme("--color-brand-white"),
              },
            },
            a: {
              color: theme("--color-brand-goldenrod"),
              "&:hover": {
                color: theme("--color-brand-soft-green"),
              },
            },
            "h1,h2,h3,h4,h5,h6": {
              color: theme("--color-brand-white"),
            },
            "b, strong": {
              color: theme("--color-brand-white"),
            },
            blockquote: {
              backgroundColor: theme("--color-brand-soft-charcoal"),
              borderColor: theme("--color-brand-goldenrod"),
              p: {
                color: theme("--color-brand-white"),
                "b, strong": {
                  color: theme("--color-brand-goldenrod"),
                },
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
