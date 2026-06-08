import { Suspense } from "react";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs, allAuthors } from "contentlayer/generated";
import { genPageMetadata } from "app/seo";
import PostListClient from "@/components/PostListClient";

export const metadata = genPageMetadata({ title: "Stories" });

export default async function StoriesPage() {
  const posts = allCoreContent(
    sortPosts(allBlogs.filter((post) => post.path.startsWith("stories/"))),
  );

  const authorMap = Object.fromEntries(
    allAuthors.map((a) => [a.slug, { name: a.name, avatar: a.avatar }]),
  );

  return (
    <Suspense>
      <PostListClient
        posts={posts}
        filterDimensions={["series", "stage", "topic"]}
        primary="stories"
        title="Stories"
        subtitle="Community spotlight, expert spotlight, and founder notes"
        authorMap={authorMap}
      />
    </Suspense>
  );
}
