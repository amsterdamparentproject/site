import { ReactNode } from "react";
import Link from "./Link";

interface CtaButtonProps {
  href: string;
  children: ReactNode;
}

// A button-styled link for MDX content — e.g. `<CtaButton href="...">Join us</CtaButton>`
// in an advice or story post. `not-prose` opts it out of the surrounding
// `.prose` typography rules (link color, underline) so these utility
// classes are the only thing controlling its look.
const CtaButton = ({ href, children }: CtaButtonProps) => {
  return (
    <Link
      href={href}
      className="not-prose inline-block rounded-md bg-brand-soft-green px-6 py-3 text-base font-medium text-brand-white no-underline hover:bg-brand-goldenrod"
    >
      {children}
    </Link>
  );
};

export default CtaButton;
