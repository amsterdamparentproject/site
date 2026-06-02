import { slug } from "github-slugger";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import ListLayout from "@/layouts/ListLayoutWithTags";
import { allBlogs } from "contentlayer/generated";
import tagData from "app/tag-data.json";
import { notFound } from "next/navigation";

type ContentType = "all" | "advice" | "stories";
const POSTS_PER_PAGE = 5;

function getContentType(post: { contentType?: string; path: string }) {
  return post.contentType === "stories" || post.path.startsWith("stories/")
    ? "stories"
    : "advice";
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>;
  return Object.keys(tagCounts).flatMap((tag) => {
    const postCount = tagCounts[tag];
    const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));
    return Array.from({ length: totalPages }, (_, i) => ({
      tag: encodeURI(tag),
      page: (i + 1).toString(),
    }));
  });
};

export default async function TagPage(props: {
  params: Promise<{ tag: string; page: string }>;
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams
    ? await props.searchParams
    : undefined;
  const tag = decodeURI(params.tag);
  const selectedType = searchParams?.type as ContentType | undefined;
  const title = tag[0].toUpperCase() + tag.split(" ").join("-").slice(1);
  const allPostsForTag = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag),
      ),
    ),
  );

  const activeType =
    selectedType === "advice" || selectedType === "stories"
      ? selectedType
      : "all";
  const filteredPosts =
    activeType === "all"
      ? allPostsForTag
      : allPostsForTag.filter((post) => getContentType(post) === activeType);

  const pageNumber = parseInt(params.page);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound();
  }
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber,
  );
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
      subtitle={
        activeType === "all"
          ? "All tagged content"
          : `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} tagged content`
      }
    />
  );
}
