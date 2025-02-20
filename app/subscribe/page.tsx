import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Disclaimer" });

export default function Page() {
  return (
    <div className="flex-column justify-center divide-y divide-gray-200 dark:divide-gray-700">
      <div className="flex flex-col items-center space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-gray-900 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
          Disclaimer
        </h1>
      </div>
      <div>
        <h1 className="mt-4 mb-2 text-2xl font-bold" id="general">
          General
        </h1>
        <p>
          The undermentioned applies to the webpage amsterdamparentproject.nl.
          By using this webpage, you agree with the disclaimer.
        </p>

        <hr className="mt-4 mb-2" />

        <h1 className="mt-4 mb-2 text-2xl font-bold" id="privacy-policy">
          Privacy Policy
        </h1>
        <p>
          This Privacy Policy describes the types of personal information
          collected, stored, and used through our website and how we protect
          your personal information. By using our website, you agree to the
          terms of this Privacy Policy.
        </p>

        <h2
          className="mt-4 mb-2 text-xl font-bold"
          id="information-collection-and-use"
        >
          Information Collection and Use
        </h2>
        <p>
          We may collect personal information such as your name, the age of your
          children, email address, phone number, and address when you register
          or make a purchase on our website. We will use this information to
          communicate with you and to provide you with the products or services
          you have requested. We may also use your information to improve our
          website and services.
        </p>
        <p>
          We will not sell, rent, or disclose your personal information to any
          third party without your consent, except as required by law or as
          necessary to provide you with the products or services you have
          requested.
        </p>

        <h2 className="mt-4 mb-2 text-xl font-bold" id="cookies">
          Cookies
        </h2>
        <p>
          We may use cookies to store and track information about your
          preferences and usage of our website. Cookies are small data files
          that are placed on your device. Most browsers allow you to control
          cookies, including whether or not to accept them and how to remove
          them.
        </p>

        <h2 className="mt-4 mb-2 text-xl font-bold" id="security">
          Security
        </h2>
        <p>
          We take reasonable steps to protect your personal information from
          unauthorized access and disclosure. We use industry-standard security
          measures like firewalls and encryption to protect your information.
        </p>

        <h2
          className="mt-4 mb-2 text-xl font-bold"
          id="links-to-other-websites"
        >
          Links to Other Websites
        </h2>
        <p>
          Our website may contain links to other websites not owned or operated
          by us. We are not responsible for the privacy practices or content of
          those websites. We encourage you to review the privacy policies of any
          third-party websites you visit.
        </p>

        <h2
          className="mt-4 mb-2 text-xl font-bold"
          id="changes-to-this-privacy-policy"
        >
          Changes to this Privacy Policy
        </h2>
        <p>
          We reserve the right to amend this Privacy Policy at any time. Changes
          will be posted on this page. Your continued use of our website after
          any changes to this Privacy Policy will constitute your acceptance of
          such changes.
        </p>

        <h2 className="mt-4 mb-2 text-xl font-bold" id="contact-us">
          Contact Us
        </h2>
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at amsterdamparentproject@gmail.com.
        </p>

        <hr className="mt-4 mb-2" />

        <h1
          className="mt-4 mb-2 text-2xl font-bold"
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
          className="mt-4 mb-2 text-2xl font-bold"
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
