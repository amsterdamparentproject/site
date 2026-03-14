import {
  Mail,
  Github,
  Linkedin,
  Instagram,
  Website,
  WhatsApp,
  Facebook,
} from "./icons";

const components = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  website: Website,
  whatsapp: WhatsApp,
  facebook: Facebook,
};

type SocialIconProps = {
  kind: keyof typeof components;
  href?: string | undefined;
  size?: number;
  style?: string;
};

const SocialIcon = ({ kind, href, size = 8 }: SocialIconProps) => {
  if (
    !href ||
    (kind === "mail" &&
      !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  )
    return null;

  const SocialSvg = components[kind];

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`hover:text-brand-soft-green dark:hover:text-brand-goldenrod fill-current text-brand-charcoal dark:text-brand-white h-${size} w-${size}`}
      />
    </a>
  );
};

export const CustomSocialIcon = ({
  kind,
  style,
  size = 8,
}: SocialIconProps) => {
  const SocialSvg = components[kind];
  const iconStyle = style
    ? style
    : "fill-current text-brand-charcoal dark:text-brand-white";

  return (
    <div>
      <span className="sr-only">{kind}</span>
      <SocialSvg className={iconStyle + ` h-${size} w-${size}`} />
    </div>
  );
};

export default SocialIcon;
