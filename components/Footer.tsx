import Link from "./Link";
import siteMetadata from "@/data/siteMetadata";
import ThemeSwitch from "./ThemeSwitch";
import SubscribeForm from "./SubscribeForm";

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-4">
          <SubscribeForm tag="website-footer" />
        </div>

        <div className="mb-2 flex space-x-2 text-md">
          <ThemeSwitch />
        </div>

        <div className="flex space-x-2 text-sm text-brand-soft-charcoal dark:text-brand-white">
          <Link
            href="mailto:amsterdamparentproject@gmail.com"
            className="hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
          >
            Contact us
          </Link>
          <div>{` • `}</div>
          <Link
            href="/disclaimer"
            className="hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
          >
            Disclaimer
          </Link>
        </div>

        <div className="mb-4 flex space-x-2 text-sm text-brand-soft-charcoal dark:text-brand-white">
          <Link
            href="/"
            className="hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
          >
            {siteMetadata.title}
          </Link>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
        </div>
      </div>
    </footer>
  );
}
