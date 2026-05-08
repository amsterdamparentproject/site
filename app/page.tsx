import { sortPosts, allCoreContent } from "pliny/utils/contentlayer";
import { allBlogs } from "contentlayer/generated";
import Main from "./Main";
import { getCalendarEvents } from "@/lib/supabase/queries/events";

export const dynamic = "force-static";

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs);
  const posts = allCoreContent(sortedPosts);
  const events = await getCalendarEvents();

  return <Main posts={posts} events={events} />;
}
