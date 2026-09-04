import { ReactNode } from "react";
import { CoreContent } from "pliny/utils/contentlayer";
import type { Blog, Authors } from "contentlayer/generated";
import Link from "@/components/Link";
import PageTitle from "@/components/PageTitle";
import SectionContainer from "@/components/SectionContainer";
import Image from "@/components/Image";
import Tag from "@/components/Tag";
import siteMetadata from "@/data/siteMetadata";
import ScrollTopAndComment from "@/components/ScrollTopAndComment";
import SocialIcon from "@/components/social-icons";

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`;

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

interface LayoutProps {
  content: CoreContent<Blog>;
  authorDetails: CoreContent<Authors>[];
  next?: { path: string; title: string };
  prev?: { path: string; title: string };
  children: ReactNode;
}

export default function PostLayout({
  content,
  authorDetails,
  next,
  prev,
  children,
}: LayoutProps) {
  const { date, title, tags } = content;

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <header className="pt-6">
          <div className="space-y-4 text-left">
            <dl>
              <dt className="sr-only">Published on</dt>
              <dd className="text-base leading-6 font-medium text-brand-soft-charcoal dark:text-brand-white">
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString(
                    siteMetadata.locale,
                    postDateTemplate,
                  )}
                </time>
              </dd>
            </dl>
            <PageTitle>{title}</PageTitle>
          </div>
        </header>

        <div className="mt-10 border-b border-brand-dark-white pb-8 dark:border-gray-700">
          <dl>
            <dt className="sr-only">Authors</dt>
            <dd>
              <ul className="flex flex-wrap gap-x-10 gap-y-6">
                {authorDetails.map((author) => (
                  <li className="flex items-center gap-3" key={author.name}>
                    {author.avatar && (
                      <Image
                        src={author.avatar}
                        width={48}
                        height={48}
                        alt="avatar"
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <dl className="leading-5 font-medium">
                      <dt className="sr-only">Name</dt>
                      <dd className="text-brand-goldenrod">
                        {(() => {
                          const authorLink =
                            author.website ||
                            author.instagram ||
                            author.linkedin;
                          return authorLink ? (
                            <Link
                              href={authorLink}
                              className="hover:text-brand-soft-green dark:hover:text-brand-white"
                            >
                              {author.name}
                            </Link>
                          ) : (
                            author.name
                          );
                        })()}
                      </dd>
                      <dt className="sr-only">Title</dt>
                      <dd className="mt-0.5 text-sm italic text-brand-soft-charcoal dark:text-brand-white">
                        {author.occupation}
                      </dd>
                      <dt className="sr-only">Socials</dt>
                      <div className="mt-1 flex gap-2">
                        {author.website && (
                          <SocialIcon
                            kind="website"
                            size={4}
                            href={author.website}
                          />
                        )}
                        {author.instagram && (
                          <SocialIcon
                            kind="instagram"
                            size={4}
                            href={author.instagram}
                          />
                        )}
                        {author.linkedin && (
                          <SocialIcon
                            kind="linkedin"
                            size={4}
                            href={author.linkedin}
                          />
                        )}
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </dd>
          </dl>
        </div>

        <div className="prose dark:prose-invert max-w-none pt-8 pb-8">
          {children}
        </div>

        <footer className="divide-y divide-gray-200 border-t border-brand-dark-white pt-8 dark:divide-gray-700 dark:border-gray-700">
          {tags && (
            <div className="pb-8 text-sm leading-5 font-medium">
              <h2 className="text-xs tracking-wide text-brand-soft-charcoal dark:text-brand-white">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </div>
          )}
          <div className="pt-8">
            <Link
              href="/read"
              className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green"
              aria-label="Back to the blog"
            >
              &larr; Back to the blog
            </Link>
          </div>
        </footer>
      </article>
    </SectionContainer>
  );
}
