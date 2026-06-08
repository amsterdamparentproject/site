import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs, allAuthors } from "contentlayer/generated";
import { genPageMetadata } from "app/seo";
import PostListClient from "@/components/PostListClient";

export const metadata = genPageMetadata({ title: "Advice" });

export default async function AdvicePage() {
  const posts = allCoreContent(
    sortPosts(allBlogs.filter((post) => post.path.startsWith("advice/"))),
  );

  const authorMap = Object.fromEntries(
    allAuthors.map((a) => [a.slug, { name: a.name, avatar: a.avatar }]),
  );

  return (
    <PostListClient
      posts={posts}
      filterDimensions={["stage", "topic"]}
      primary="advice"
      title="Dear Dr. Mom"
      subtitle="Expert advice from parenting professionals"
      authorMap={authorMap}
    />
  );
}
