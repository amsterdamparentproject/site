import { coreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs, allAuthors } from "contentlayer/generated";
import type { Blog } from "contentlayer/generated";
import PostListClient from "@/components/PostListClient";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const posts = sortPosts(
    allBlogs.filter((p) => p.path.startsWith("advice/templates/")),
  ).map((p) => coreContent(p as Blog));

  const authorMap = Object.fromEntries(
    allAuthors.map((a) => [a.slug, { name: a.name, avatar: a.avatar }]),
  );

  return (
    <PostListClient
      posts={posts}
      filterDimensions={["series"]}
      primary="all"
      title="Templates"
      subtitle="Story templates for contributors"
      authorMap={authorMap}
    />
  );
}
