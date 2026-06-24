import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";

export const metadata = genPageMetadata({
  title: "Privacy Policy",
  description:
    "How Amsterdam Parent Project collects, uses, and protects your personal information.",
});

const linkClass =
  "text-brand-goldenrod hover:text-brand-soft-green underline underline-offset-2";
const h2Class =
  "text-brand-charcoal dark:text-brand-white mt-8 mb-2 text-2xl font-bold";
const h3Class =
  "text-brand-charcoal dark:text-brand-white mt-4 mb-1 text-lg font-semibold";

export default function Page() {
  return (
    <div className="flex-column justify-center divide-y divide-gray-200 dark:divide-gray-700">
      <div className="flex flex-col items-center space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-brand-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: June 2026
        </p>
      </div>

      <div className="max-w-3xl">
        <section>
          <h2 className={h2Class} id="who-we-are">
            Who we are
          </h2>
          <p className="mb-2">
            Amsterdam Parent Project is a community organization based in
            Amsterdam, the Netherlands (KvK 95875921). We are the data
            controller responsible for the personal information described in
            this policy, which covers our website at amsterdamparentproject.nl
            — including our newsletter, parent-groups directory, donations and
            program registrations, and community calendar.
          </p>
          <p className="mb-2">
            You can reach us at{" "}
            <Link
              href="mailto:hello@amsterdamparentproject.nl"
              className={linkClass}
            >
              hello@amsterdamparentproject.nl
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={h2Class} id="what-we-collect">
            What we collect and why
          </h2>
          <p className="mb-2">
            We collect only the information we need to run our community and
            services.
          </p>

          <h3 className={h3Class}>Newsletter</h3>
          <p className="mb-2">
            When you sign up for our newsletter, we collect your email address
            (and any interest tags you select). We use these to send you our
            newsletter. The legal basis is your <em>consent</em>, which you can
            withdraw at any time using the unsubscribe link in every email.
          </p>

          <h3 className={h3Class}>Parent groups directory</h3>
          <p className="mb-2">
            If you submit a group listing or request access to our directory of
            local parent groups, we collect your name, email address, and the
            relevant group categories. We use these to maintain the directory
            and to give you access to it. The legal basis is your{" "}
            <em>consent</em> and our <em>legitimate interest</em> in running a
            community directory.
          </p>

          <h3 className={h3Class}>Donations and program registrations</h3>
          <p className="mb-2">
            When you make a donation or register for a program, payments are
            processed by Stripe. We do not store your card details — Stripe
            handles all payment data under their own{" "}
            <Link
              href="https://stripe.com/privacy"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </Link>
            . We receive your name, email, and confirmation of your payment. The
            legal basis is <em>performance of a contract</em> (for program
            registrations) and your <em>consent</em> (for voluntary donations).
          </p>

          <h3 className={h3Class}>Community calendar</h3>
          <p className="mb-2">
            If you submit an event to our community calendar, we collect the
            event details and your contact information so we can review and
            publish it. This information is stored in our own database. The
            legal basis is our <em>legitimate interest</em> in running a
            community calendar.
          </p>

          <h3 className={h3Class}>Analytics</h3>
          <p className="mb-2">
            We use Umami for website analytics. Umami is a privacy-first tool
            that does not use cookies and does not collect personal data. It
            gives us aggregate information about how people use the site, so we
            can improve it.
          </p>
        </section>

        <section>
          <h2 className={h2Class} id="who-we-share-with">
            Who we share your data with
          </h2>
          <p className="mb-2">
            We do not sell or rent your personal data. We share it only with the
            services that help us run Amsterdam Parent Project:
          </p>
          <ul className="mb-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Beehiiv</strong> — newsletter delivery
            </li>
            <li>
              <strong>Stripe</strong> — payment processing for donations and
              program registrations
            </li>
            <li>
              <strong>Supabase</strong> — secure database hosting (EU region)
              for the parent-groups directory
            </li>
            <li>
              <strong>Netlify</strong> — website hosting
            </li>
            <li>
              <strong>Umami</strong> — privacy-first website analytics (no
              personal data shared)
            </li>
          </ul>
          <p className="mb-2">
            Each of these providers processes data only as necessary to deliver
            their service, and is bound by appropriate data processing
            agreements. Some of them (such as Stripe and Beehiiv) process data
            outside the European Economic Area; where they do, the transfer is
            protected by the EU–US Data Privacy Framework and/or Standard
            Contractual Clauses. Our database (Supabase) is hosted within the
            EU.
          </p>
        </section>

        <section>
          <h2 className={h2Class} id="retention">
            How long we keep your data
          </h2>
          <p className="mb-2">
            We keep newsletter data until you unsubscribe. Directory information
            is kept while your listing is active or you need access, and is
            removed on request. Financial records relating to donations and
            program payments are kept for 7 years, as required by Dutch tax law.
            You can request deletion of your data at any time (see below).
          </p>
        </section>

        <section>
          <h2 className={h2Class} id="your-rights">
            Your rights under GDPR
          </h2>
          <p className="mb-2">
            Because we are based in the EU, you have the following rights over
            your personal data:
          </p>
          <ul className="mb-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Access</strong> — request a copy of the data we hold about
              you
            </li>
            <li>
              <strong>Rectification</strong> — ask us to correct inaccurate data
            </li>
            <li>
              <strong>Erasure</strong> — ask us to delete your data
            </li>
            <li>
              <strong>Portability</strong> — receive your data in a
              machine-readable format
            </li>
            <li>
              <strong>Restriction</strong> — ask us to limit how we process your
              data
            </li>
            <li>
              <strong>Objection</strong> — object to processing based on
              legitimate interests
            </li>
          </ul>
          <p className="mb-2">
            To exercise any of these rights, email us at{" "}
            <Link
              href="mailto:hello@amsterdamparentproject.nl"
              className={linkClass}
            >
              hello@amsterdamparentproject.nl
            </Link>
            . We will respond within 30 days. You also have the right to lodge a
            complaint with the Dutch Data Protection Authority (
            <Link
              href="https://www.autoriteitpersoonsgegevens.nl"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Autoriteit Persoonsgegevens
            </Link>
            ).
          </p>
        </section>

        <section>
          <h2 className={h2Class} id="cookies">
            Cookies
          </h2>
          <p className="mb-2">
            Our website uses only essential cookies necessary for it to function
            and to process payments securely. We do not use tracking or
            advertising cookies, and our analytics tool (Umami) is cookieless.
          </p>
        </section>

        <section>
          <h2 className={h2Class} id="changes">
            Changes to this policy
          </h2>
          <p className="mb-2">
            If we make significant changes to this policy, we will note them
            here. The &ldquo;last updated&rdquo; date at the top of this page
            will always reflect the most recent version.
          </p>
        </section>

        <section className="mb-8">
          <h2 className={h2Class} id="contact">
            Questions?
          </h2>
          <p className="mb-2">
            Email us at{" "}
            <Link
              href="mailto:hello@amsterdamparentproject.nl"
              className={linkClass}
            >
              hello@amsterdamparentproject.nl
            </Link>
            . We are happy to help.
          </p>
        </section>
      </div>
    </div>
  );
}
