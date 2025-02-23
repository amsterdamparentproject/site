import { TeamMembers, allTeamMembers } from "contentlayer/generated";
import { MDXLayoutRenderer } from "pliny/mdx-components";
import AuthorLayout from "@/layouts/AuthorLayout";
import { coreContent } from "pliny/utils/contentlayer";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "About" });

export default function Page() {
  const authorDetails = allTeamMembers.map((author) => {
    return {
      coreContent: coreContent(author as TeamMembers),
      raw: author,
    };
  });

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          The team
        </h1>
      </div>
      {/* TODO: Sort teammembers, separate contributor from core team */}
      {authorDetails.map((author) => (
        <div key={author.coreContent.name}>
          <AuthorLayout content={author.coreContent}>
            <MDXLayoutRenderer code={author.raw.body.code} />
          </AuthorLayout>
        </div>
      ))}
    </div>
  );
}
