import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs } from "contentlayer/generated";
import { genPageMetadata } from "app/seo";
import ContributeFlow from "@/components/ContributeFlow";

export const metadata = genPageMetadata({
  title: "Contribute to Amsterdam Parent Project",
});

export default async function Page() {
  // Last 3 published Dear Dr. Mom articles, shown inline in the form so
  // contributors can reference recent house style — same fetch pattern as
  // app/advice/page.tsx.
  const recentDearDrMom = allCoreContent(
    sortPosts(
      allBlogs.filter((post) => post.path.startsWith("advice/") && !post.draft),
    ),
  )
    .slice(0, 3)
    .map((post) => ({ title: post.title, href: `/${post.path}` }));

  return (
    <div>
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14 text-center">
          Share your story
          <br />
          or expertise
        </h1>
      </div>

      <div className="flex flex-col items-center space-y-2 md:pt-4 pb-8 md:space-y-5">
        <p className="max-w-xl text-center mb-4">
          Thank you for contributing to Amsterdam Parent Project! We're so
          excited to hear from you and share your story with the (new) parents
          of babies and toddlers in our community ❤️
        </p>

        <ContributeFlow recentDearDrMom={recentDearDrMom} />

        <div className="max-w-lg px-3 w-full">
          <p className="text-sm text-gray-500 italic mt-2">
            Questions about any of this? Reach out anytime at{" "}
            <a
              href="mailto:hello@amsterdamparentproject.nl"
              className="underline"
            >
              hello@amsterdamparentproject.nl
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
