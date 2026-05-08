"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import SubscribeForm from "@/components/SubscribeForm";

export default function NewsletterCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="order-2 md:order-1 bg-brand-sand/40 dark:bg-brand-sand/10 rounded-3xl p-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
          Biweekly newsletter
        </h2>
        <p className="text-brand-charcoal dark:text-brand-white mb-6">
          Expert advice and local activities for parents of babies and toddlers
          in Amsterdam
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors cursor-pointer"
          data-umami-event="Home: Subscribe newsletter"
        >
          Subscribe
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Subscribe to Just a Phase"
        description="Expert advice and local events for parents of babies and toddlers in Amsterdam, sent every other Monday at 3pm."
        size="sm"
      >
        <SubscribeForm tag="homepage" hideCtaLabel={true} fullWidth={true} />
      </Modal>
    </>
  );
}
