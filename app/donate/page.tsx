import Script from "next/script";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Donate" });

function BuyButton() {
  const buyButtonId = "buy_btn_1SPjo7QXyrloqZVhJuJ88ZPy";
  const publishableKey =
    "pk_live_51SPjE2QXyrloqZVh2slle48bZ0dI3Ud73x4180eRaszI8PZwlJNQi4Jk5wwz2LEhnywF8Z1RoCRw9S4icO9yKSOK00IvDsDylL";

  return (
    <div>
      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="lazyOnload"
      />

      {/* @ts-ignore: Property 'stripe-buy-button' does not exist on type 'JSX.IntrinsicElements'. */}
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
        style={{ margin: "20px auto", display: "block" }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
          Donate
        </h1>
      </div>
      <div className="flex flex-col items-center mt-6">
        <p className="max-w-lg text-center">
          By donating to APP, you're helping us keep our newsletter free and our
          program costs as low as possible — so that{" "}
          <b className="text-brand-soft-green dark:text-brand-goldenrod">
            APP remains sustainable and accessible to all community parents who
            need it
          </b>
          .
        </p>

        <BuyButton />

        <div>
          <h1 className="mt-2 mb-2 text-2xl text-brand-soft-green dark:text-brand-goldenrod text-center">
            Recurring costs you're offsetting:
          </h1>
          <ul className="text-center">
            <li>
              <b>Newsletter</b>: €80 per issue (€160 per month)
            </li>
            <li>
              <b>Fourth Trimester Program</b>: €180 per month
            </li>
            <li>
              <b>Burnout support meetups</b>: €40 per session
            </li>
            <li>
              <b>Operational costs</b>: €150 per month
            </li>
          </ul>
          <p className="mt-4 italic max-w-sm text-center">
            APP is completely self-funded by a local parent, so every little bit
            helps! 🫶🏻
          </p>
        </div>
      </div>
    </div>
  );
}
