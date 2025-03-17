import SubscribeForm from "@/components/SubscribeForm";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Subscribe" });

export default function Page() {
  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-gray-900 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
          Subscribe
        </h1>
      </div>
      <br />
      <SubscribeForm tag="website-subscribe" />
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
