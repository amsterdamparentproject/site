import Link from "./Link";
import siteMetadata from "@/data/siteMetadata";
import SocialIcon from "@/components/social-icons";
import NewsletterForm from "pliny/ui/NewsletterForm";
import SearchButton from "./SearchButton";

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div>
          <Link href="/subscribe" aria-label="Subscribe">
            <p className="font-medium text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod">
              Subscribe to our newsletter:
            </p>
          </Link>
          {siteMetadata.newsletter?.provider && (
            <div className="flex items-center justify-center mt-1 mb-6">
              <iframe
                title="newsletter-subscribe-footer"
                src="https://embeds.beehiiv.com/91a659aa-6a60-4d9e-9b7a-03f3f1e5f98e?slim=true"
                data-test-id="beehiiv-embed"
                height="52"
                className="bg-transparent"
                suppressHydrationWarning
              ></iframe>
            </div>
          )}
        </div>

        <div className="mb-4 flex space-x-2 text-sm text-brand-soft-charcoal dark:text-brand-white">
          <Link href="/">{siteMetadata.title}</Link>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
