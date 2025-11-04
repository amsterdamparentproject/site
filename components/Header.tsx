import siteMetadata from "@/data/siteMetadata";
import headerNavLinks from "@/data/headerNavLinks";
import Logo from "./Logo";
import Link from "./Link";
import MobileNav from "./MobileNav";
import SocialIcon from "@/components/social-icons";

const Header = () => {
  let headerClass =
    "flex items-center w-full text-brand-charcoal bg-brand-white dark:bg-brand-charcoal justify-between pt-10 pb-6 md:pb-8";
  if (siteMetadata.stickyNav) {
    headerClass += " sticky top-0 z-50";
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center justify-between">
          <div className="mr-4">
            <Logo size="50" />
          </div>
          {typeof siteMetadata.headerTitle === "string" ? (
            <div className="hidden h-6 text-2xl/5 font-semibold sm:block text-brand-charcoal dark:text-brand-white">
              {siteMetadata.headerTitle}
            </div>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
        <div className="no-scrollbar hidden items-center gap-x-4 overflow-x-auto md:flex max-w-40 md:max-w-72 lg:max-w-96">
          {headerNavLinks
            .filter((link) => link.href !== "/")
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                target={link.newTab ? "_blank" : ""}
                className={link.style}
              >
                {link.title}
              </Link>
            ))}
        </div>
        <SocialIcon kind="instagram" href={siteMetadata.instagram} size={5} />
        <MobileNav />
      </div>
    </header>
  );
};

export default Header;
