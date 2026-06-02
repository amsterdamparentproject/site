import Link from "@/components/Link";
import { slug } from "github-slugger";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import siteMetadata from "@/data/siteMetadata";
import ListLayout from "@/layouts/ListLayoutWithTags";
import { allBlogs } from "contentlayer/generated";
import tagData from "app/tag-data.json";
import { genPageMetadata } from "app/seo";
import { Metadata } from "next";

type ContentType = "all" | "advice" | "stories";
const POSTS_PER_PAGE = 5;
const contentTypeLabels: Record<ContentType, string> = {
  all: "All",
  advice: "Advice",
  stories: "Stories",
};

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const tag = decodeURI(params.tag);
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: "./",
      types: {
        "application/rss+xml": `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  });
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>;
  const tagKeys = Object.keys(tagCounts);
  return tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }));
};

function getContentType(post: { contentType?: string; path: string }) {
  return post.contentType === "stories" || post.path.startsWith("stories/")
    ? "stories"
    : "advice";
}

export default async function TagPage(props: {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams
    ? await props.searchParams
    : undefined;
  const tag = decodeURI(params.tag);
  const selectedType = searchParams?.type as ContentType | undefined;
  const tagSlug = slug(tag);
  const title = tag[0].toUpperCase() + tag.split(" ").join("-").slice(1);
  const allPostsForTag = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag),
      ),
    ),
  );

  const counts = allPostsForTag.reduce(
    (acc, post) => {
      const type = getContentType(post);
      acc[type] += 1;
      acc.all += 1;
      return acc;
    },
    { all: 0, advice: 0, stories: 0 },
  );

  const activeType =
    selectedType === "advice" || selectedType === "stories"
      ? selectedType
      : "all";
  const filteredPosts =
    activeType === "all"
      ? allPostsForTag
      : allPostsForTag.filter((post) => getContentType(post) === activeType);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE);
  const pagination = {
    currentPage: 1,
    totalPages: totalPages,
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        {(["all", "advice", "stories"] as ContentType[]).map((type) => (
          <Link
            key={type}
            href={
              type === "all"
                ? `/tags/${tagSlug}`
                : `/tags/${tagSlug}?type=${type}`
            }
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeType === type
                ? "border-brand-soft-green bg-brand-soft-green/10 text-brand-charcoal"
                : "border-gray-200 bg-white text-gray-600 hover:border-brand-soft-green hover:text-brand-charcoal dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-brand-white"
            }`}
          >
            {contentTypeLabels[type]} ({counts[type]})
          </Link>
        ))}
      </div>
      <ListLayout
        posts={filteredPosts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title={title}
        subtitle={
          activeType === "all"
            ? "All tagged content"
            : `${contentTypeLabels[activeType]} tagged content`
        }
      />
    </>
  );
}
