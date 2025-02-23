"use client";

import siteMetadata from "@/data/siteMetadata";
import { useState } from "react";
import subscribeToNewsletter from "./Subscribe";

const SubscribeForm = (Props) => {
  const { label, tag } = Props;
  const [emailInput, setEmailInput] = useState("");

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
  };

  if (siteMetadata.newsletter?.provider) {
    return (
      <form className="max-w-sm mx-auto">
        <label
          htmlFor="subscribe-email"
          className="block mb-2 font-medium text-brand-charcoal dark:text-brand-white"
        >
          {label ? label : "Subscribe to our newsletter:"}
        </label>
        <div className="flex">
          <input
            type="text"
            id="subscribe-email"
            className="rounded-none rounded-l-lg bg-white border border-2 border-brand-goldenrod text-brand-charcoal 
                block flex-1 min-w-0 w-full 
                placeholder-brand-soft-charcoal/60
                text-md p-2.5 focus:ring-transparent"
            onChange={updateEmailInput}
            value={emailInput}
            placeholder="Enter your email"
          />
          <button
            className="inline-flex cursor-pointer items-center px-3 text-md text-brand-charcoal bg-brand-goldenrod
                border border-l-0 border-brand-goldenrod rounded-e-md"
            onClick={processSubscription}
            type="submit"
          >
            Subscribe
          </button>
        </div>
      </form>
    );
  }
};

export default SubscribeForm;
