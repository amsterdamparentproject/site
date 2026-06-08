import { Suspense } from "react";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs, allAuthors } from "contentlayer/generated";
import { genPageMetadata } from "app/seo";
import PostListClient from "@/components/PostListClient";

export const metadata = genPageMetadata({
  title: "Read",
  description: "All posts — advice and stories — from Amsterdam Parent Project",
});

export default async function ReadPage() {
  const posts = allCoreContent(sortPosts(allBlogs));

  const authorMap = Object.fromEntries(
    allAuthors.map((a) => [a.slug, { name: a.name, avatar: a.avatar }]),
  );

  return (
    <Suspense>
      <PostListClient
        posts={posts}
        filterDimensions={["type", "series", "stage", "topic", "freeResource"]}
        primary="all"
        title="Read"
        subtitle="All advice and stories"
        authorMap={authorMap}
      />
    </Suspense>
  );
}
