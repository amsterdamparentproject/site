import Link from "next/link";
import { slug } from "github-slugger";
interface Props {
  text: string;
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green mr-3 text-sm font-medium uppercase"
    >
      {text}
    </Link>
  );
};

export default Tag;
