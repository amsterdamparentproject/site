import ListLayout from "@/layouts/ListLayoutWithTags";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs } from "contentlayer/generated";
import { notFound } from "next/navigation";

const POSTS_PER_PAGE = 5;

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(
    allBlogs.filter((post) => post.path.startsWith("stories/")).length /
      POSTS_PER_PAGE,
  );
  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString(),
  }));
};

export default async function Page(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const posts = allCoreContent(
    sortPosts(allBlogs.filter((post) => post.path.startsWith("stories/"))),
  );
  const pageNumber = parseInt(params.page as string);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound();
  }

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber,
  );
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="Stories"
      subtitle="Community spotlight, expert spotlight, and founder notes"
    />
  );
}
