import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Disclaimer" });

export default function Page() {
  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-gray-900 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
          Subscribe
        </h1>
      </div>
      <iframe
        title="newsletter-subscribe"
        src="https://embeds.beehiiv.com/91a659aa-6a60-4d9e-9b7a-03f3f1e5f98e"
        data-test-id="beehiiv-embed"
        width="100%"
        height="320"
      ></iframe>
      <div className="pb-8">
        <h1
          className="mt-4 mb-2 text-2xl text-brand-charcoal text-center"
          id="copyrights-and-intellectual-proprietary-rights"
        >
          In each issue:
        </h1>
        <ul className="text-center">
          <li>
            <b>Local events</b> happening over the next two weeks
          </li>
          <li>
            <b>Expert advice</b> answering questions from community parents
          </li>
          <li>
            <b>First dibs on tickets</b> to APP events and programs
          </li>
        </ul>
        <p className="mt-6 text-center">Sent every other Monday at 3pm</p>
      </div>
    </div>
  );
}
