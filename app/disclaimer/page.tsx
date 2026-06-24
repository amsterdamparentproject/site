import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";

export const metadata = genPageMetadata({ title: "Disclaimer" });

export default function Page() {
  return (
    <div className="flex-column justify-center divide-y divide-gray-200 dark:divide-gray-700">
      <div className="flex flex-col items-center space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-brand-white">
          Disclaimer
        </h1>
      </div>
      <div>
        <h1
          className="text-brand-charcoal dark:text-brand-white mt-4 mb-2 text-2xl font-bold"
          id="general"
        >
          General
        </h1>
        <p>
          The undermentioned applies to the webpage amsterdamparentproject.nl.
          By using this webpage, you agree with the disclaimer.
        </p>

        <hr className="mt-4 mb-2" />

        <h1
          className="text-brand-charcoal dark:text-brand-white mt-4 mb-2 text-2xl font-bold"
          id="privacy-policy"
        >
          Privacy Policy
        </h1>
        <p>
          For details on the personal information we collect, how we use and
          protect it, and your rights, please see our{" "}
          <Link
            href="/privacy"
            className="text-brand-goldenrod hover:text-brand-soft-green underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <hr className="mt-4 mb-2" />

        <h1
          className="text-brand-charcoal dark:text-brand-white mt-4 mb-2 text-2xl font-bold"
          id="exclusion-of-liability"
        >
          Exclusion of Liability
        </h1>
        <p className="mb-2">
          We provide the information and materials on this website as a service
          to our customers and website visitors. We strive to provide accurate
          and current information, but we make no warranties or representations
          about the completeness, accuracy, reliability, suitability, or
          availability of the information, products, services, or related
          graphics contained on the website for any purpose.
        </p>
        <p className="mb-2">
          We hereby disclaim all warranties and conditions concerning the
          website, including but not limited to all implied warranties and
          conditions of merchantability, fitness for a particular purpose,
          title, and non-infringement. In no event shall we be liable for any
          direct, indirect, incidental, punitive, special, or consequential
          damages arising out of or in any way connected with the use of or
          inability to use the website or for any information, products,
          services, or related graphics obtained through the website, even if
          advised of the possibility of such damages.
        </p>
        <p className="mb-2">
          We reserve the right to make changes to the website and the
          information, products, services, or related graphics at any time
          without notice. The inclusion of any links to other websites does not
          imply endorsement by Amsterdam Parent Project of those websites or
          their content. Use of any such linked websites is at the user’s own
          risk.
        </p>
        <p className="mb-2">
          Any information provided is for general purposes only and does not
          constitute legal, financial, or any other type of advice. You should
          not rely on any such information without seeking professional advice.
        </p>
        <p className="mb-2">
          Using this website, you agree to the terms of this exclusion of
          liability. If you do not agree with these terms, please do not use the
          website.
        </p>

        <hr className="mt-4 mb-2" />

        <h1
          className="text-brand-charcoal dark:text-brand-white mt-4 mb-2 text-2xl font-bold"
          id="copyrights-and-intellectual-proprietary-rights"
        >
          Copyrights and intellectual proprietary rights
        </h1>
        <p>
          All content on this website is the intellectual property of Amsterdam
          Parent Project and is protected by copyright laws. You may not
          reproduce, distribute, modify, transmit, reuse, or adapt any content
          without the written permission of Amsterdam Parent Project.
        </p>

        <p className="mt-6 text-center">Published on 20 February, 2025</p>
      </div>
    </div>
  );
}
