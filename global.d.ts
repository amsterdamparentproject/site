// global.d.ts

declare namespace JSX {
  interface IntrinsicElements {
    // Add other custom elements here if needed
    "stripe-buy-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
