// global.d.ts

interface StripeBuyButtonProps {
  "buy-button-id": string;
  "publishable-key": string;
}

declare namespace JSX {
  interface IntrinsicElements {
    "stripe-buy-button": // 1. Core HTML and event attributes
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
      // 2. DOM attributes (includes standard 'style' prop)
      React.DOMAttributes<HTMLElement> &
      // 3. Stripe specific props
      StripeBuyButtonProps;
  }
}
