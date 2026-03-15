"use client";

import { memo } from "react";

import siteMetadata from "@/data/siteMetadata";
import headerNavLinks from "@/data/headerNavLinks";
import Logo from "./Logo";
import Link from "./Link";
import MobileNav from "./MobileNav";
import SocialIcon from "@/components/social-icons";

const Header = () => {
  const stickyClass = siteMetadata.stickyNav ? " sticky top-0 z-50" : "";
  const headerClass = `flex items-center h-28 md:h-32 w-full text-brand-charcoal bg-brand-white dark:bg-brand-charcoal justify-between px-5 md:px-10 xl:px-50 2xl:px-80 ${stickyClass}`;

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center justify-between">
          <div className="mr-4 flex-shrink-0">
            <Logo size="50" />
          </div>
          {typeof siteMetadata.headerTitle === "string" ? (
            <div className="hidden h-auto text-2xl leading-[0.9] font-semibold sm:block md:max-w-50 lg:max-w-500 text-brand-charcoal dark:text-brand-white">
              {siteMetadata.headerTitle}
            </div>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <div className="flex items-center space-x-4 md:ml-5 leading-5 sm:-mr-6 sm:space-x-6">
        <div className="no-scrollbar hidden items-center gap-x-4 overflow-x-auto md:flex">
          {headerNavLinks
            .filter((link) => link.href !== "/")
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className={link.style}
                target={link.newTab ? "_blank" : ""}
                prefetch={link.prefetch}
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

export default memo(Header);
