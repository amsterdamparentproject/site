import { sortPosts, allCoreContent } from "pliny/utils/contentlayer";
import { allBlogs } from "contentlayer/generated";
import Main from "./Main";

// This tells Next.js to always fetch fresh data
// for this page, instead of using static generation or caching.
export const dynamic = "force-dynamic";

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs);
  const posts = allCoreContent(sortedPosts);

  return <Main posts={posts} />;
}
