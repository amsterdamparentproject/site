import Link from "./Link";
import siteMetadata from "@/data/siteMetadata";
import SocialIcon from "@/components/social-icons";
import NewsletterForm from "pliny/ui/NewsletterForm";
import SearchButton from "./SearchButton";

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        {siteMetadata.newsletter?.provider && (
          <div className="flex items-center justify-center pt-4 mb-6">
            <iframe
              title="newsletter-subscribe-footer"
              src="https://embeds.beehiiv.com/91a659aa-6a60-4d9e-9b7a-03f3f1e5f98e?slim=true"
              data-test-id="beehiiv-embed"
              height="52"
              suppressHydrationWarning
            ></iframe>
          </div>
        )}
        <div className="mb-4 flex space-x-4">
          <SocialIcon
            kind="mail"
            href={`mailto:${siteMetadata.email}`}
            size={6}
          />
          <SocialIcon kind="github" href={siteMetadata.github} size={6} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
          <SocialIcon kind="instagram" href={siteMetadata.instagram} size={6} />
        </div>
        <div className="mb-4 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
