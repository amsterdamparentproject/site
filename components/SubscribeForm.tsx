"use client";

import siteMetadata from "@/data/siteMetadata";
import { useState } from "react";
import subscribeToNewsletter from "./Subscribe";

const SubscribeForm = (Props) => {
  const { ctaLabel, subscribedLabel, tag } = Props;
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const updateEmailInput = (e) => {
    const val = e.target.value;
    setEmailInput(val);
  };

  const processSubscription = async (e) => {
    e.preventDefault();

    subscribeToNewsletter({
      email: emailInput,
      tag: tag,
      referringSite: String(window.location),
    });

    setEmailInput("");
    setSubscribed(true);
  };

  const accentColor = Props.color ? Props.color : "brand-goldenrod";
  const inputStyle = `min-w-40 sm:w-md rounded-none rounded-l-lg bg-white border border-2 border-brand-goldenrod text-brand-charcoal block flex-1 min-w-0 w-full placeholder-brand-soft-charcoal/60 text-md p-2.5 focus:ring-transparent`;
  const buttonStyle = `inline-flex cursor-pointer items-center px-3 text-md text-brand-charcoal bg-brand-goldenrod border border-l-0 border-brand-goldenrod rounded-e-md`;

  if (siteMetadata.newsletter?.provider) {
    return (
      <form className="max-w-sm mx-auto">
        <label
          htmlFor="subscribe-email"
          className="block mb-2 font-medium text-brand-charcoal dark:text-brand-white"
        >
          {ctaLabel ? ctaLabel : "Subscribe to our newsletter:"}
        </label>
        <div className="flex flex-wrap">
          <input
            type="text"
            id="subscribe-email"
            className={inputStyle}
            onChange={updateEmailInput}
            value={emailInput}
            placeholder="Enter your email"
          />
          <button
            className={buttonStyle}
            onClick={processSubscription}
            type="submit"
          >
            Subscribe
          </button>
          <p
            className={
              "w-full mt-2 text-brand-soft-green dark:text-brand-goldenrod" +
              (!subscribed ? " hidden" : "")
            }
          >
            {subscribedLabel ? subscribedLabel : "Thanks for subscribing!"}
          </p>
        </div>
      </form>
    );
  }
};

export default SubscribeForm;
